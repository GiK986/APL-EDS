# Искане към Java сървиса: SecureRandom суфикс в SESSION_ID

Част от [access-protection-sid.md](access-protection-sid.md) — отделено в собствен файл,
защото засяга друг проект/екип (Java сървисът, който генерира `CATALOG_USERS.SESSION_ID`),
не apl-eds.

## Проблем

Текущият формат `SESSION_ID = <LOGIN>-ddMMyyyyHHmm` е отгатваем — логинът е проста дума,
а датата има само 1440 възможни стойности на ден. Външен клиент, който знае/налучка логин,
може да улучи валидна сесия чрез изброяване.

## Искане

При генерирането на сесията да се добави криптографски случаен суфикс:

```java
import java.security.SecureRandom;

private static final SecureRandom RNG = new SecureRandom();
private static final String ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

static String randomSuffix(int len) {
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) {
        sb.append(ALPHABET.charAt(RNG.nextInt(ALPHABET.length())));
    }
    return sb.toString();
}

// SESSION_ID = login + "-" + ddMMyyyyHHmm + "-" + randomSuffix(16)
// пример: "alcars-100720261347-Kq9mTz2rWpX7Lc4v"
```

- Задължително `SecureRandom`, **не** `java.util.Random` (последният е предвидим).
- 16 символа от този набор ≈ 95 бита ентропия — практически неулучваемо.
- Никаква друга промяна не е нужна: записът в базата и подаването към TM1 остават същите;
  проверяващата страна (apl-eds) търси точно съвпадение на целия низ, форматът не я интересува.
- Само да се провери, че колоната `SESSION_ID` побира новата дължина (изглежда широка,
  вероятно е ок).

## Статус

Все още не е препратено/имплементирано (към 2026-07-13) — този файл е готовата чернова за
копиране към Java екипа, когато решиш да го изпратиш.
