'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getOperationForm,
  findVehicleOperation,
  findVehicle,
  findByPlateNumber,
} from '@/actions/yq';
import type { FormV2Dto, VehicleV2Dto, FieldV2, SelectV2 } from '@/types/yq';
import { cn } from '@/lib/utils';
import { t, type Lang } from '@/lib/i18n';

interface VehicleWizardProps {
  initialForm: FormV2Dto;
  brand: string;
  vinForm?: FormV2Dto;
  plateForm?: FormV2Dto;
  lang: Lang;
}

type Tab = 'wizard' | 'vin' | 'plate';

export function VehicleWizard({
  initialForm,
  brand,
  vinForm,
  plateForm,
  lang,
}: VehicleWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>('wizard');

  // Wizard state
  const [wizardForm, setWizardForm] = useState<FormV2Dto>(initialForm);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleV2Dto[]>([]);

  // VIN search state
  const [vinValue, setVinValue] = useState('');
  const [vinError, setVinError] = useState<string | null>(null);
  const [vinVehicles, setVinVehicles] = useState<VehicleV2Dto[]>([]);

  // Plate search state
  const [plateValue, setPlateValue] = useState('');
  const [plateCountry, setPlateCountry] = useState('');
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateVehicles, setPlateVehicles] = useState<VehicleV2Dto[]>([]);

  function navigateToVehicle(vehicle: VehicleV2Dto) {
    const groupsLink = vehicle.navigationLinks.find((l) => l.code === 'GROUPS');
    const mainLink = vehicle.navigationLinks.find((l) => l.code === 'MAIN');
    if (!groupsLink) return;
    const params = new URLSearchParams({
      token: groupsLink.token,
      navToken: mainLink?.token ?? '',
    });
    router.push(`/catalog/${encodeURIComponent(brand)}/groups?${params}`);
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

        // Check if we can now resolve the vehicle
        const allSelected = updated.data.fields
          .filter((f): f is SelectV2 => f.type === 'select')
          .every((f) => f.options.some((o) => o.selected));

        if (allSelected && updated.data.action === 'findVehicleOperation') {
          const selectedValues = updated.data.fields
            .filter((f): f is SelectV2 => f.type === 'select')
            .map((f) => ({
              name: f.name,
              value: f.options.find((o) => o.selected)!.value,
            }));
          const res = await findVehicleOperation(updated.data.token, selectedValues);
          setVehicles(res.data?.vehicles ?? []);
        }
      } catch {
        setWizardError(t('formUpdateFailed', lang));
      }
    });
  }

  function handleVinSearch() {
    if (!vinValue.trim() || !vinForm) return;
    setVinError(null);
    setVinVehicles([]);
    startTransition(async () => {
      try {
        const res = await findVehicle(vinForm.token, [
          { name: 'IdentString', value: vinValue.trim() },
        ]);
        const vs = res.data?.vehicles ?? [];
        if (vs.length === 0) setVinError(t('noVehicleFoundVin', lang));
        else if (vs.length === 1) navigateToVehicle(vs[0]);
        else setVinVehicles(vs);
      } catch {
        setVinError(t('vinSearchFailed', lang));
      }
    });
  }

  function handlePlateSearch() {
    if (!plateValue.trim()) return;
    setPlateError(null);
    setPlateVehicles([]);
    startTransition(async () => {
      try {
        const formValues = [{ name: 'PlateNumber', value: plateValue.trim() }];
        if (plateCountry) formValues.push({ name: 'CountryCode', value: plateCountry });
        const res = await findByPlateNumber(formValues);
        const vs = res.data?.vehicles ?? [];
        if (vs.length === 0) setPlateError(t('noVehicleFoundPlate', lang));
        else if (vs.length === 1) navigateToVehicle(vs[0]);
        else setPlateVehicles(vs);
      } catch {
        setPlateError(t('plateSearchFailed', lang));
      }
    });
  }

  const plateCountryCodes = plateForm?.fields.find(
    (f): f is SelectV2 => f.type === 'select' && f.name === 'CountryCode'
  )?.options ?? [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        {([
          ['wizard', t('tabModelYear', lang)],
          ...(vinForm ? [['vin', t('tabVin', lang)]] : []),
          ...(plateForm ? [['plate', t('tabPlate', lang)]] : []),
        ] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Wizard tab */}
      {activeTab === 'wizard' && (
        <div className="space-y-4">
          {wizardForm.fields.map((field) => (
            <WizardField
              key={field.name}
              field={field}
              onChange={(value) => handleWizardChange(field.name, value)}
              disabled={isPending}
              lang={lang}
            />
          ))}
          {wizardError && (
            <p className="text-sm text-destructive">{wizardError}</p>
          )}
          {vehicles.length > 0 && (
            <VehicleList vehicles={vehicles} onSelect={navigateToVehicle} lang={lang} />
          )}
        </div>
      )}

      {/* VIN tab */}
      {activeTab === 'vin' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={vinValue}
              onChange={(e) => setVinValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVinSearch()}
              placeholder="e.g. ZFA31200000451262"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleVinSearch}
              disabled={isPending || !vinValue.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {t('search', lang)}
            </button>
          </div>
          {vinError && <p className="text-sm text-destructive">{vinError}</p>}
          {vinVehicles.length > 0 && (
            <VehicleList vehicles={vinVehicles} onSelect={navigateToVehicle} lang={lang} />
          )}
        </div>
      )}

      {/* Plate tab */}
      {activeTab === 'plate' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {plateCountryCodes.length > 0 && (
              <select
                value={plateCountry}
                onChange={(e) => setPlateCountry(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('countryCode', lang)}</option>
                {plateCountryCodes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={plateValue}
              onChange={(e) => setPlateValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlateSearch()}
              placeholder="e.g. KS666ER"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handlePlateSearch}
              disabled={isPending || !plateValue.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {t('search', lang)}
            </button>
          </div>
          {plateError && <p className="text-sm text-destructive">{plateError}</p>}
          {plateVehicles.length > 0 && (
            <VehicleList vehicles={plateVehicles} onSelect={navigateToVehicle} lang={lang} />
          )}
        </div>
      )}

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
  lang: Lang;
}

function WizardField({ field, onChange, disabled, lang }: WizardFieldProps) {
  if (field.type === 'input') {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{field.label}</label>
        <input
          type="text"
          placeholder={field.examples?.[0]?.value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>
    );
  }

  const selected = field.options.find((o) => o.selected);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{field.label}</label>
      <select
        value={selected?.value ?? ''}
        disabled={disabled || field.options.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        <option value="">{t('selectPlaceholder', lang)}</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
