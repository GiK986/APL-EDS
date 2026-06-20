// YQ Service REST API v2 — TypeScript types

export interface FormValueV2 {
  name: string;
  value: string;
}

export interface LinkV2Dto {
  action: string;
  label: string;
  token: string;
}

export interface NavigationLinkV2Dto {
  action: string;
  label: string;
  token: string;
  code: string; // "MAIN" | "GROUPS"
}

export interface ErrorDtoV2 {
  code?: string;
  message?: string;
}

export interface OptionV2 {
  value: string;
  label: string;
  selected?: boolean;
}

export interface ExampleValueV2 {
  description: string;
  value: string;
}

export interface InputFieldV2 {
  type: 'input';
  name: string;
  label: string;
  pattern?: string;
  examples?: ExampleValueV2[];
}

export interface SelectV2 {
  type: 'select';
  name: string;
  label: string;
  options: OptionV2[];
  selected?: boolean;
}

export type FieldV2 = InputFieldV2 | SelectV2;

export interface FormV2Dto {
  action: string;
  updateFormAction?: string;
  label: string;
  operationName: string;
  description?: string;
  token: string;
  fields: FieldV2[];
}

export interface AttrNodeV2 {
  code: string;
  label: string;
  values: string[];
  type: string;
  children?: AttrNodeV2[];
}

export interface CatalogV2Dto {
  token: string;
  name: string;
  brand: string;
  archived: boolean;
  links: LinkV2Dto[];
}

export interface CatalogListV2Dto {
  catalogs: CatalogV2Dto[];
  forms?: FormV2Dto[];
}

export interface CatalogListResponseV2 {
  dataType: string;
  data: CatalogListV2Dto;
  error?: ErrorDtoV2;
}

export interface CatalogInfoV2Dto {
  token: string;
  name: string;
  brand: string;
  archived: boolean;
  forms: FormV2Dto[];
  links?: LinkV2Dto[];
}

export interface CatalogInfoResponseV2 {
  dataType: string;
  data: CatalogInfoV2Dto;
  error?: ErrorDtoV2;
}

export interface VehicleV2Dto {
  token: string;
  type: string;
  brand: string;
  model: string;
  attributes: AttrNodeV2[];
  sysProperties: Array<{ code: string; value: string }>;
  navigationLinks: NavigationLinkV2Dto[];
  links: LinkV2Dto[];
  forms?: FormV2Dto[];
}

export interface VehicleListV2Dto {
  vehicles: VehicleV2Dto[];
}

export interface VehicleListResponseV2 {
  dataType: string;
  data: VehicleListV2Dto;
  error?: ErrorDtoV2;
}

export interface VehicleResponseV2 {
  dataType: string;
  data: VehicleV2Dto;
  error?: ErrorDtoV2;
}

export interface OperationFormResponseV2 {
  dataType: string;
  data: FormV2Dto;
  error?: ErrorDtoV2;
}

export interface GroupNodeV2Dto {
  token?: string;
  name: string;
  code?: string;
  links?: LinkV2Dto[];
  children?: GroupNodeV2Dto[];
}

export interface GroupsTreeResponseV2 {
  dataType: string;
  data: GroupNodeV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export type CategoryNodeV2Dto = GroupNodeV2Dto;

export interface NavigationTreeResponseV2 {
  dataType: string;
  data: CategoryNodeV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface PartQtyV2 {
  note?: string;
  qty?: number;
}

export interface PartV2Dto {
  partNumber: string;
  partName?: string;
  qty?: PartQtyV2;
  partNumberFormatted?: string;
  displayName?: string;
  attributes?: AttrNodeV2[];
  areaCode?: string;
  matched?: boolean;
  refs?: LinkV2Dto[];
  related?: LinkV2Dto[];
  links?: LinkV2Dto[];
}

export interface UnitShortV2Dto {
  code: string;
  name: string;
  description?: string;
  token?: string;
  imageNames?: string[];
  links?: LinkV2Dto[];
  attributes?: AttrNodeV2[];
}

export interface PartSectionV2Dto {
  title?: string;
  parts?: PartV2Dto[];
}

export interface UnitShortListV2Dto {
  units: UnitShortV2Dto[];
}

export interface UnitsListResponseV2 {
  dataType: string;
  data: UnitShortListV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface PartSectionsListV2Dto {
  partSections: PartSectionV2Dto[];
}

export interface PartsSectionsResponseV2 {
  dataType: string;
  data: PartSectionsListV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface PartsByUnitV2Dto {
  unit: UnitShortV2Dto;
  partSections: PartSectionV2Dto[];
  token?: string;
  imageNames?: string[];
}

export interface CategoryV2Dto {
  category: UnitShortV2Dto;
  units: PartsByUnitV2Dto[];
}

export interface PartsListByCategoryV2Dto {
  categories: CategoryV2Dto[];
}

export interface PartsListByCategoryResponseV2 {
  dataType: string;
  data: PartsListByCategoryV2Dto;
  currentFilterState?: string;
  error?: ErrorDtoV2;
}

export interface ImageMapAreaV2Dto {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  areaCode: string;
  /** Present on "REF." callouts — jumps to another unit's diagram instead of
   * highlighting a row in this one's parts table. */
  links?: LinkV2Dto[];
}

export interface ImageMapV2Dto {
  imageName: string;
  areas: ImageMapAreaV2Dto[];
}

export interface UnitInfoV2Dto {
  code: string;
  name: string;
  links?: LinkV2Dto[];
  token?: string;
  imageMaps?: ImageMapV2Dto[];
  attributes?: AttrNodeV2[];
}

export interface UnitInfoResponseV2 {
  dataType: string;
  data: UnitInfoV2Dto;
  error?: ErrorDtoV2;
}

export interface PartReferenceV2Dto {
  partNumber: string;
  partName?: string;
  catalogs: CatalogV2Dto[];
}

export interface PartReferencesListV2Dto {
  partReferences: PartReferenceV2Dto[];
}

export interface PartReferencesResponseV2 {
  dataType: string;
  data: PartReferencesListV2Dto;
  error?: ErrorDtoV2;
}

export interface CustomerDto {
  login: string;
}

export interface CustomerResponseV2 {
  dataType: string;
  data: CustomerDto;
  error?: ErrorDtoV2;
}
