# План: Защита на apl-eds от публичен достъп (SID проверка срещу MSSQL + IP allowlist)

## Context
Приложението се публикува на `apl-eds.autoplus.bg` и се вгражда като iframe в TM1/Next
Catalogue. В момента няма автентикация; единствената защита е Traefik IP allowlist в prod
compose. Целта: случаен посетител да не ползва каталога; потребител, влязъл през TM1, да
го зарежда безпроблемно в iframe.

**Схема:** вход с `?sid=` в iframe URL-а → проверка срещу MSSQL view при първата заявка →
наша подписана httpOnly cookie за останалата сесия. OR логика в Next.js proxy-то:
позволено IP ИЛИ валидна cookie ИЛИ валиден SID; иначе `/forbidden` (403).

**Обновено 2026-07-11 — плъзгаща сесия:** cookie-то вече носи и `sid`-а вътре в себе си
(base64url + HMAC покрива и двете полета), не само expiry. Живот 3 часа, плъзгащ се:
при заявка с под 30 мин остатъчен живот proxy-то тихо препроверява `sid`-а срещу базата и
преиздава cookie с нов 3-часов прозорец — активен потребител никога не удря стената.
`?sid=` в query-то, различен от вградения в текущата cookie, винаги се осиновява веднага
(независимо от оставащия живот на старата сесия) — така TM1 презаписва сесията при нов вход.
`sid`-ът никога не напуска сървъра/httpOnly cookie-то — не се пази в sessionStorage/localStorage,
за да не стане четим от клиентски JS.

## Решени параметри
- **View:** `[STORE_IT_APL_PROD].[dbo].[V_EXT_APL_EDS_SESSIONS]` — колони `SESSION_ID`,
  `LAST_LOGIN`, само активни потребители с ненулев SID. Съществува и работи (проверено).
- **DB достъп:** read-only потребител; dev по външен адрес `31.13.228.173:1433`, prod по
  вътрешен (разликата е само `DB_HOST`). Драйвер: npm пакет `mssql`.
- **Свежест:** `LAST_LOGIN >= DATEADD(HOUR, -8, GETDATE())` — изцяло на DB сървъра.
- **SID формат:** `<LOGIN>-ddMMyyyyHHmm` (Java страната ще добави SecureRandom суфикс —
  отделен проект, не е наша задача).
- **`SESSION_ID` се презаписва при всеки вход** — откраднат SID умира при следващ логин.

## Global Constraints
- TypeScript strict, no `any`; named exports; 2-space indent; без коментари освен
  неочевидно WHY (стилът на репото).
- Session cookie: httpOnly, `Secure`, **`SameSite=None`** (задължително за cross-origin
  TM1 iframe — урок от commit 5af4c55), живот 3 часа, плъзгащ се (виж по-горе).
- Proxy-то е **fail-closed** при DB грешка за нови входове (лог + forbidden); влезли с
  валидна cookie не зависят от базата.
- SID никога не остава в адресната лента: успешен вход → redirect към чист URL.
- `npm run check` (lint + typecheck + build) трябва да е зелен.
- Env променливи: `ALLOWED_IPS`, `SESSION_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`,
  `DB_PASSWORD`, `DB_NAME=STORE_IT_APL_PROD`, `ACCESS_PROTECTION_DISABLED` (dev bypass).

## Task 1: Session cookie подписване + SID валидация срещу MSSQL

Създай два модула в `src/lib/`:

**`src/lib/session-cookie.ts`** — подписана session cookie стойност:
- `createSessionValue(): string` → `"<expiryEpochMs>.<hmacHex>"`, където
  `hmacHex = HMAC-SHA256(String(expiryEpochMs), SESSION_SECRET)` (пълен hex digest);
  expiry = now + 8h.
- `verifySessionValue(value: string): boolean` → парсира, проверява expiry в бъдещето и
  HMAC с `crypto.timingSafeEqual` (при различна дължина → false, без exception).
- Име на cookie: константа `SESSION_COOKIE_NAME = "apl_session"` (export).
- Липсващ `SESSION_SECRET` env → throw при използване (както `yqFetch` прави с ключа).

**`src/lib/session-db.ts`** — SID lookup:
- `validateSid(sid: string): Promise<boolean>` с npm пакета `mssql` (добави го като
  dependency).
- Connection pool като модулен singleton (глобален кеш, преживяващ повторни извиквания).
- Заявка с параметър (не конкатенация):
  `SELECT 1 AS ok FROM dbo.V_EXT_APL_EDS_SESSIONS WHERE SESSION_ID = @sid AND LAST_LOGIN >= DATEADD(HOUR, -8, GETDATE())`
- Config от env: `DB_HOST`, `DB_PORT` (default 1433), `DB_USER`, `DB_PASSWORD`,
  `DB_NAME`; `options: { encrypt: false, trustServerCertificate: true }` (self-hosted
  SQL Server без TLS сертификат; ако връзката иска друго — коригирай и докладвай).
- Всяка грешка (мрежа, auth, timeout ~5s) → `return false` + `console.error` (fail-closed).

**Верификация (задължителна, срещу живата база):**
- Вземи реален свеж SID: `sqlcmd query -q "SELECT TOP (1) SESSION_ID FROM [STORE_IT_APL_PROD].[dbo].[V_EXT_APL_EDS_SESSIONS] WHERE LAST_LOGIN >= DATEADD(HOUR, -8, GETDATE()) ORDER BY LAST_LOGIN DESC"`
  (sqlcmd е конфигуриран на машината).
- Еднократен скрипт (`node --env-file=.env.local`, TS през `npx tsx` е ок) който:
  валиден SID → true; несъществуващ SID → false; SID на стар запис → false; грешен
  DB_HOST → false (fail-closed, не exception).
- Cookie модула: sign → verify → true; подправен подпис → false; изтекъл expiry → false;
  боклук низ → false.
- `npm run lint && npm run typecheck` зелени. Комитни.

## Task 2: proxy.ts + /forbidden страница + край-до-край проверка

**`src/proxy.ts`** (Next 16 конвенция — НЕ `middleware.ts`, той е deprecated; функцията
се казва `proxy`; Node runtime е по подразбиране, `runtime` config не се задава; виж
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`):

- `config.matcher` изключва статиката: `_next/static`, `_next/image`, `favicon.ico`,
  пътищата от `public/` (`/images`, `/videos`, `/seo`) и `/forbidden`.
- Ред на проверките:
  1. `ACCESS_PROTECTION_DISABLED=1` → `NextResponse.next()` (локален dev bypass).
  2. IP от header `x-real-ip` (сетва го Traefik) е в CSV списъка `ALLOWED_IPS` → next.
  3. Cookie `apl_session` минава `verifySessionValue` → next.
  4. Query `?sid=` минава `validateSid` → redirect (302) към същия URL без `sid`
     параметъра, със `Set-Cookie` (httpOnly, Secure, SameSite=None, maxAge 8h,
     стойност от `createSessionValue`).
  5. Иначе → rewrite към `/forbidden`.
- Преизползвай `SESSION_COOKIE_NAME`, `createSessionValue`, `verifySessionValue`,
  `validateSid` от Task 1.

**`src/app/forbidden/page.tsx`** — статична страница в стила на каталога (сив фон,
центрирана карта, заглавие "403", текст на български "Нямате право на достъп до този
каталог." + "Достъпът се осъществява през Next Catalogue."). Без навигация към каталога.
Route handler-ът/страницата да върне статус 403 (виа `export const dynamic` не стига —
ползвай подходящия Next 16 механизъм, провери в докс; ако единственият чист начин е
страницата да се сервира с 200 след rewrite, допустимо е, но опитай първо с 403).

**Верификация (задължителна, реален dev сървър):**
- `npm run dev` (без `ACCESS_PROTECTION_DISABLED`), после curl матрицата:
  - `curl -i localhost:3000/` → forbidden съдържание;
  - `curl -i -H "x-real-ip: <IP от ALLOWED_IPS>" localhost:3000/` → каталогът;
  - `curl -i "localhost:3000/?sid=<реален свеж SID>"` → 302 без `sid` + `Set-Cookie`;
  - `curl -i --cookie "apl_session=<стойността от горното>" localhost:3000/catalog/vw` →
    минава;
  - `curl -i "localhost:3000/?sid=fake-123"` → forbidden;
  - `curl -i localhost:3000/favicon.ico` и `/_next/static/...` → 200 без защита.
- `npm run check` зелен. Комитни.

## Извън обхвата на задачите (ръчни стъпки при деплой — за човека)
- `docker-compose.prod.yml` на прод сървъра: махане на `ipAllowList` от router-а,
  добавяне на env променливите (`DB_HOST` = вътрешния адрес, нов `SESSION_SECRET`).
- TM1 iframe URL-ът да включва `?sid=<SESSION_ID>`.
- Java проектът: SecureRandom суфикс (препратено отделно).
- Healthcheck-ът в gitignore-натия `docker-compose.prod.yml` на прод сървъра трябва да се
  коригира по същия начин като в tracked `docker-compose.yml` — да сочи към
  `http://localhost:3000/favicon.ico` вместо `/`, иначе gate-ът връща 403, контейнерът
  става unhealthy и Traefik сваля router-а.
- Прод контейнерът НЕ трябва да публикува порта си директно (никакъв `ports:` mapping) —
  само външната `proxy` мрежа. Цялата доверителна граница на `x-real-ip` предполага, че
  Traefik е единственият вход; директно публикуван порт позволява подправен `x-real-ip`.

## Verification (цялостна, след двете задачи)
- Curl матрицата от Task 2 + проверка че статика/OG не са счупени.
- `npm run check` зелен.
- Прод тестът в реалния TM1 iframe е след деплой, извън тази сесия.
