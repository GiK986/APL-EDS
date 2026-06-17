'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getOperationForm, findVehicleOperation } from '@/actions/yq';
import type { FormV2Dto, VehicleV2Dto, FieldV2 } from '@/types/yq';
import { cn } from '@/lib/utils';
import { t, type Lang } from '@/lib/i18n';
import { buildVehicleGroupsHref } from '@/lib/vehicle-nav';
import { Breadcrumb } from '@/components/catalog/breadcrumb';

interface VehicleWizardProps {
  initialForm: FormV2Dto;
  brand: string;
  brandLabel: string;
  lang: Lang;
}

function selectedFieldLabels(form: FormV2Dto): string[] {
  const labels: string[] = [];
  for (const field of form.fields) {
    if (field.type !== 'select') continue;
    const chosen =
      field.options.find((o) => o.selected) ??
      (field.options.length === 1 ? field.options[0] : undefined);
    if (chosen) labels.push(chosen.label);
  }
  return labels;
}

export function VehicleWizard({
  initialForm,
  brand,
  brandLabel,
  lang,
}: VehicleWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [wizardForm, setWizardForm] = useState<FormV2Dto>(initialForm);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleV2Dto[]>([]);

  function navigateToVehicle(vehicle: VehicleV2Dto) {
    const href = buildVehicleGroupsHref(brand, vehicle);
    if (href) router.push(href);
  }

  function handleWizardChange(fieldName: string, value: string) {
    setWizardError(null);
    setVehicles([]);
    startTransition(async () => {
      try {
        const updated = await getOperationForm(wizardForm.token, [
          { name: fieldName, value },
        ]);
        setWizardForm(updated.data);
      } catch {
        setWizardError(t('formUpdateFailed', lang));
      }
    });
  }

  const wizardReady = wizardForm.action === 'findVehicleOperation';

  function handleWizardSearch() {
    if (!wizardReady) return;
    setWizardError(null);
    setVehicles([]);
    startTransition(async () => {
      try {
        // wizardForm.token already encodes every selection made so far —
        // resending field values here causes the API to reject the request
        // with "Invalid parameter".
        const res = await findVehicleOperation(wizardForm.token, []);
        const vs = res.data?.vehicles ?? [];
        if (vs.length === 0) setWizardError(t('noVehicleFoundWizard', lang));
        else setVehicles(vs);
      } catch {
        setWizardError(t('wizardSearchFailed', lang));
      }
    });
  }

  const wizardFieldLabels = selectedFieldLabels(wizardForm);
  const breadcrumbSegments = [
    { label: t('start', lang), href: '/' },
    {
      label: brandLabel,
      href: wizardFieldLabels.length > 0 ? `/catalog/${encodeURIComponent(brand)}` : undefined,
    },
    ...wizardFieldLabels.map((label) => ({ label })),
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb segments={breadcrumbSegments} />

      <div className="space-y-4">
        <div className="flex overflow-x-auto rounded border border-[#6e6e6e]">
          {wizardForm.fields.map((field) => (
            <WizardField
              key={field.name}
              field={field}
              onChange={(value) => handleWizardChange(field.name, value)}
              disabled={isPending}
            />
          ))}
        </div>
        {wizardReady && (
          <button
            onClick={handleWizardSearch}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {t('search', lang)}
          </button>
        )}
        {wizardError && <p className="text-sm text-destructive">{wizardError}</p>}
        {vehicles.length > 0 && (
          <VehicleList vehicles={vehicles} onSelect={navigateToVehicle} lang={lang} />
        )}
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground animate-pulse">{t('loading', lang)}</p>
      )}
    </div>
  );
}

// Sub-components

interface WizardFieldProps {
  field: FieldV2;
  onChange: (value: string) => void;
  disabled: boolean;
}

function WizardField({ field, onChange, disabled }: WizardFieldProps) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col border-r border-[#6e6e6e] last:border-r-0">
      <div className="bg-[#808285] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#e4e4e4]">
        {field.label}
      </div>
      <div className="max-h-[420px] overflow-y-auto bg-white">
        {field.type === 'input' ? (
          <input
            type="text"
            placeholder={field.examples?.[0]?.value ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border-0 px-3 py-2 text-[11px] font-bold text-[#808080] outline-none disabled:opacity-50"
          />
        ) : (
          field.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              disabled={disabled}
              className={cn(
                'block w-full px-3 py-1.5 text-left text-[11px] font-bold text-[#808080] transition-colors hover:bg-[#e4e4e4] disabled:cursor-not-allowed',
                (opt.selected || field.options.length === 1) && 'bg-[#f7c400]'
              )}
            >
              {opt.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

interface VehicleListProps {
  vehicles: VehicleV2Dto[];
  onSelect: (vehicle: VehicleV2Dto) => void;
  lang: Lang;
}

function VehicleList({ vehicles, onSelect, lang }: VehicleListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {`${vehicles.length} ${t('vehicleFoundSuffix', lang)}`}
      </h3>
      <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {vehicles.map((v, i) => (
          <li key={v.token ?? i}>
            <button
              onClick={() => onSelect(v)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
            >
              <div className="text-sm font-medium">{v.model}</div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {v.attributes.slice(0, 4).map((a) => (
                  <span key={a.code}>
                    {a.label}: {a.values.join(', ')}
                  </span>
                ))}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
