import { cn } from '@/lib/utils';
import type { CategoryV2Dto, PartV2Dto } from '@/types/yq';
import { t, type Lang } from '@/lib/i18n';

interface PartsTableProps {
  categories: CategoryV2Dto[];
  lang: Lang;
}

export function PartsTable({ categories, lang }: PartsTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">{t('noResults', lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((cat, ci) => (
        <div key={cat.category.token ?? ci} className="space-y-4">
          <h2 className="text-base font-semibold">
            {cat.category.name}
            {cat.category.code && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                #{cat.category.code}
              </span>
            )}
          </h2>

          {cat.units.map((unitData, ui) => (
            <div key={unitData.unit.code ?? ui} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">{unitData.unit.name}</h3>
                  {unitData.unit.code && (
                    <p className="text-xs text-muted-foreground">
                      {t('unitLabel', lang)}: {unitData.unit.code}
                    </p>
                  )}
                </div>
                {unitData.imageNames?.[0] && (
                  <img
                    src={unitData.imageNames[0].replace('%size%', 'thumb')}
                    alt={unitData.unit.name}
                    className="h-24 w-auto rounded-lg border border-border object-contain"
                  />
                )}
              </div>

              {unitData.partSections.map((section, si) => (
                <div key={si}>
                  {section.title && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </p>
                  )}
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-10">
                            {t('position', lang)}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                            {t('partNumber', lang)}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                            {t('partName', lang)}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground w-16">
                            {t('qty', lang)}
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground hidden lg:table-cell">
                            {t('remarks', lang)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {section.parts.map((part, pi) => (
                          <PartRow key={part.partNumber + pi} part={part} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PartRow({ part }: { part: PartV2Dto }) {
  const remarks = part.attributes
    ?.filter((a) => a.code !== 'GROUP' && a.code !== 'YEAR_RANGE')
    .flatMap((a) => a.values)
    .join('; ');

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-muted/40',
        part.matched && 'bg-primary/5'
      )}
    >
      <td className="px-3 py-2 text-center text-xs text-muted-foreground">
        {part.areaCode}
      </td>
      <td className="px-3 py-2 font-mono text-xs font-medium">
        {part.partNumberFormatted ?? part.partNumber}
      </td>
      <td className="px-3 py-2">
        <div className="font-medium">{part.displayName || part.partName}</div>
        {part.displayName && part.partName !== part.displayName && (
          <div className="text-xs text-muted-foreground">{part.partName}</div>
        )}
      </td>
      <td className="px-3 py-2 text-center text-xs">
        {part.qty?.note ?? part.qty?.qty ?? '—'}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground hidden lg:table-cell">
        {remarks || '—'}
      </td>
    </tr>
  );
}
