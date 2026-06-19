'use server';

import { cookies } from 'next/headers';
import { yqFetch } from '@/lib/yq-api';
import type {
  CatalogListResponseV2,
  CatalogInfoResponseV2,
  VehicleListResponseV2,
  OperationFormResponseV2,
  GroupsTreeResponseV2,
  NavigationTreeResponseV2,
  PartsListByCategoryResponseV2,
  UnitInfoResponseV2,
  UnitsListResponseV2,
  PartsSectionsResponseV2,
  PartReferencesResponseV2,
  VehicleResponseV2,
  FormValueV2,
} from '@/types/yq';

async function lang(): Promise<string> {
  const store = await cookies();
  return store.get('lang')?.value ?? 'en';
}

export async function getLang(): Promise<string> {
  return lang();
}

export async function setLang(value: string): Promise<void> {
  const store = await cookies();
  store.set('lang', value === 'bg' ? 'bg' : 'en', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}

export async function getCatalogs(): Promise<CatalogListResponseV2> {
  return yqFetch<CatalogListResponseV2>('/restApi/v2/catalogs', {}, await lang());
}

export async function getCatalogInfo(token: string): Promise<CatalogInfoResponseV2> {
  return yqFetch<CatalogInfoResponseV2>('/restApi/v2/getCatalogInfo', { token }, await lang());
}

export async function getOperationForm(
  token: string,
  formValues: FormValueV2[]
): Promise<OperationFormResponseV2> {
  return yqFetch<OperationFormResponseV2>(
    '/restApi/v2/getOperationForm',
    { token, formValues },
    await lang()
  );
}

export async function findVehicleOperation(
  token: string,
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findVehicleOperation',
    { token, formValues },
    await lang()
  );
}

export async function findVehicle(
  token: string,
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findVehicle',
    { token, formValues },
    await lang()
  );
}

export async function searchVehicleByVin(
  brand: string,
  vin: string
): Promise<VehicleListResponseV2 | null> {
  const catalogsRes = await getCatalogs();
  const catalog = catalogsRes.data?.catalogs.find(
    (c) => c.brand.toLowerCase().replace(/\s+/g, '-') === brand
  );
  if (!catalog) return null;

  const infoToken = catalog.links[0]?.token ?? catalog.token;
  const infoRes = await getCatalogInfo(infoToken);
  const vinForm = infoRes.data?.forms.find((f) => f.operationName === 'FINDVEHICLE_V2');
  if (!vinForm) return null;

  return findVehicle(vinForm.token, [{ name: 'IdentString', value: vin }]);
}

export async function searchVehicleByVinGlobal(vin: string): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findVehicle',
    { token: null, formValues: [{ name: 'IdentString', value: vin }] },
    await lang()
  );
}

export async function getGroups(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<GroupsTreeResponseV2> {
  return yqFetch<GroupsTreeResponseV2>(
    '/restApi/v2/getGroups',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getNavigationTree(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<NavigationTreeResponseV2> {
  return yqFetch<NavigationTreeResponseV2>(
    '/restApi/v2/getNavigationTree',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getGroupParts(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<PartsListByCategoryResponseV2> {
  return yqFetch<PartsListByCategoryResponseV2>(
    '/restApi/v2/getGroupParts',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getGroupPartsAll(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<PartsListByCategoryResponseV2> {
  return yqFetch<PartsListByCategoryResponseV2>(
    '/restApi/v2/getGroupPartsAll',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getVehicleInfo(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<VehicleResponseV2> {
  return yqFetch<VehicleResponseV2>(
    '/restApi/v2/getVehicleInfo',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getUnitInfo(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<UnitInfoResponseV2> {
  return yqFetch<UnitInfoResponseV2>(
    '/restApi/v2/getUnitInfo',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getUnits(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<UnitsListResponseV2> {
  return yqFetch<UnitsListResponseV2>(
    '/restApi/v2/getUnits',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function getUnitParts(
  token: string,
  filterValues: FormValueV2[] = [],
  currentFilterState = ''
): Promise<PartsSectionsResponseV2> {
  return yqFetch<PartsSectionsResponseV2>(
    '/restApi/v2/getUnitParts',
    { token, filterValues, currentFilterState },
    await lang()
  );
}

export async function findPartReferences(
  token: string,
  formValues: FormValueV2[]
): Promise<PartReferencesResponseV2> {
  return yqFetch<PartReferencesResponseV2>(
    '/restApi/v2/findPartReferences',
    { token, formValues },
    await lang()
  );
}

export async function findApplicableVehicles(
  token: string,
  formValues: FormValueV2[]
): Promise<VehicleListResponseV2> {
  return yqFetch<VehicleListResponseV2>(
    '/restApi/v2/findApplicableVehicles',
    { token, formValues },
    await lang()
  );
}

export async function getPartApplicability(
  token: string,
  formValues: FormValueV2[]
): Promise<PartsListByCategoryResponseV2> {
  return yqFetch<PartsListByCategoryResponseV2>(
    '/restApi/v2/getPartApplicability',
    { token, formValues },
    await lang()
  );
}
