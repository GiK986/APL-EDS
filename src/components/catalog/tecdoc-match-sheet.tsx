'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { setVehicleProperties, setVehicleTecDocNumber } from '@/lib/tm1-bridge';
import { t, type Lang } from '@/lib/i18n';
import type { TecDocMatch } from '@/actions/tecdoc';

function formatModelYear(yyyymm: number): string {
  if (!yyyymm) return '?';
  const month = String(yyyymm % 100).padStart(2, '0');
  return `${month}.${Math.floor(yyyymm / 100)}`;
}

// setVehicleTecDocNumber resolves asynchronously on TM1's side (it fetches
// the full TecDoc model before attaching) and gives us no completion signal
// — this delay before following up with the VIN is an empirical guess based
// on the request chain observed live, not a real acknowledgement.
const VEHICLE_ATTACH_DELAY_MS = 1500;

interface TecDocMatchSheetProps {
  // null = closed, [] = searched but nothing found, non-empty = candidates to pick from
  matches: TecDocMatch[] | null;
  vin?: string;
  onClose: () => void;
  onAdd: () => void;
  lang: Lang;
}

export function TecDocMatchSheet({ matches, vin, onClose, onAdd, lang }: TecDocMatchSheetProps) {
  function handleAdd(match: TecDocMatch) {
    setVehicleTecDocNumber(match.ktypNo);
    if (vin) {
      setTimeout(() => setVehicleProperties({ vin }), VEHICLE_ATTACH_DELAY_MS);
    }
    onAdd();
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
                {matches.map((m) => (
                  <tr key={m.ktypNo}>
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
                        className="w-full rounded-[3px] bg-[rgb(224,224,224)] px-3 py-1.5 text-sm font-medium text-[rgb(33,33,33)] transition-colors hover:bg-[rgb(100,101,103)] hover:text-white active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]"
                      >
                        {t('tecDocChooseMatch', lang)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
