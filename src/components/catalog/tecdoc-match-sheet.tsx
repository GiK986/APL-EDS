'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  getCustomerData,
  setEngineCode,
  setVehicleProperties,
  setVehicleTecDocNumber,
} from '@/lib/tm1-bridge';
import { t, type Lang } from '@/lib/i18n';
import type { TecDocMatch } from '@/actions/tecdoc';

function formatModelYear(yyyymm: number): string {
  if (!yyyymm) return '?';
  const month = String(yyyymm % 100).padStart(2, '0');
  return `${month}.${Math.floor(yyyymm / 100)}`;
}

// Relative to the best-scored candidate in *this* result set, not an
// absolute confidence — the theoretical max score depends on which signals
// (date/kW/HP/brand) were even available for this vehicle, so an absolute
// percentage would understate good matches whenever some signal is missing.
function matchPercent(score: number, topScore: number): number {
  return topScore > 0 ? Math.round((score / topScore) * 100) : 0;
}

// TM1 handles every one of these commands by re-merging onto whatever
// props.workTask.vehicle currently is (see tm1-bridge.ts). Firing two of
// them back-to-back is racy: the second one's merge is based on whatever
// snapshot TM1's React tree happened to hold at that instant, which may not
// yet include the first one's change — live-verified, an engineCode sent
// right alongside setVehicleProperties got silently wiped out because
// setVehicleProperties's own merge (based on the pre-engineCode snapshot)
// landed after it. So these have to run in sequence, each one waiting for
// the previous to actually be visible before the next fires.
const ATTACH_POLL_INTERVAL_MS = 300;
const ATTACH_POLL_TIMEOUT_MS = 6000;
// engineCode has no readback (getCustomerData's vehicle shape doesn't
// include it), so there's nothing to poll for after setEngineCode — this is
// a fixed grace delay instead, empirically chosen the same way the original
// blind delay was.
const ENGINE_CODE_SETTLE_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForVehicleAttach(): Promise<void> {
  const deadline = Date.now() + ATTACH_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const data = await getCustomerData();
    if (data?.vehicle) return;
    await delay(ATTACH_POLL_INTERVAL_MS);
  }
}

interface TecDocMatchSheetProps {
  // null = closed, [] = searched but nothing found, non-empty = candidates to pick from
  matches: TecDocMatch[] | null;
  vin?: string;
  engineCode?: string;
  initialRegistration?: string;
  onClose: () => void;
  onAdd: () => void;
  lang: Lang;
}

export function TecDocMatchSheet({
  matches,
  vin,
  engineCode,
  initialRegistration,
  onClose,
  onAdd,
  lang,
}: TecDocMatchSheetProps) {
  async function handleAdd(match: TecDocMatch) {
    setVehicleTecDocNumber(match.ktypNo);
    onAdd();
    if (!vin && !initialRegistration && !engineCode) return;
    await waitForVehicleAttach();
    if (engineCode) {
      setEngineCode(engineCode);
      await delay(ENGINE_CODE_SETTLE_DELAY_MS);
    }
    if (vin || initialRegistration) setVehicleProperties({ vin, initialRegistration });
  }

  return (
    <Sheet open={matches !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('selectTecDocMatch', lang)}</SheetTitle>
        </SheetHeader>

        {matches?.length === 0 && (
          <p className="text-sm text-destructive">{t('sendToTm1NotFound', lang)}</p>
        )}

        {matches && matches.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocMatchPercent', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocModelSeries', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocType', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocEngineCode', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t('tecDocProductionYears', lang)}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocPower', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocCapacity', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocCylinders', lang)}</th>
                  <th className="px-3 py-2 text-left font-medium">{t('tecDocFuelType', lang)}</th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(() => {
                  const topScore = Math.max(...matches.map((m) => m.score));
                  return matches.map((m) => {
                    const isBest = m.score === topScore;
                    return (
                      <tr key={m.ktypNo} className={isBest ? 'bg-green-600/10' : undefined}>
                        <td className="px-3 py-2">
                          <span
                            className={
                              isBest
                                ? 'font-semibold text-green-700'
                                : 'text-muted-foreground'
                            }
                          >
                            {matchPercent(m.score, topScore)}%
                          </span>
                        </td>
                        <td className="px-3 py-2">{m.modelSeriesText || m.ktypNo}</td>
                        <td className="px-3 py-2 font-medium">{m.typeText}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {m.engineCodes.join(', ')}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {formatModelYear(m.modYFrom)} – {formatModelYear(m.modYTo)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {m.kw ? `${m.kw} kW / ${m.hp} HP` : ''}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                          {m.ccm ? `${m.ccm} ccm` : ''}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{m.cyl || ''}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.fuelType}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleAdd(m)}
                            className="w-full cursor-pointer rounded-[3px] bg-[rgb(224,224,224)] px-3 py-1.5 text-sm font-medium text-[rgb(33,33,33)] transition-colors hover:bg-[rgb(100,101,103)] hover:text-white active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]"
                          >
                            {t('tecDocChooseMatch', lang)}
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
