# YQ OEM REST API — Workflow Diagram

Mermaid transcription of the official process diagram from
`YQCAT_RESTAPI_DOCUMENTATION (4-5).pdf` (pages 1–2 of the source PDF). This
diagram is not present in the plain-text `YQCAT_RESTAPI_DOCUMENTATION.md`
export — it only exists as an image in the PDF, hence this file.

**Legend:** ovals = function/endpoint calls (`POST /restApi/v2/...`),
rectangles = response data structures. Dashed arrows = alternative/related
path called out in the original diagram, not a strict "produces" relation.

## Catalog phase — find a vehicle (brand not yet pinned to one vehicle)

```mermaid
flowchart TD
    catalogs(("catalogs"))
    catalogList["catalogList:<br/>1. catalog1<br/>2. catalog2..."]
    getCatalogInfo(("getCatalogInfo"))
    catalogInfo["catalogInfo:<br/>1. form1<br/>2. form2..."]
    findPartReferences(("findPartReferences<br/>(PartNumber)"))
    findVehicle(("findVehicle<br/>(IdentString)"))
    findByPlateNumber(("findByPlateNumber<br/>(PlateNumber, CountryCode)"))
    findApplicableVehicles(("findApplicableVehicles<br/>(PartNumber, IncludeReplacements)"))
    getOperationForm(("getOperationForm<br/>(form parameters)"))
    operationForm["operation form"]
    findVehicleOperation(("findVehicleOperation<br/>(form parameters)"))
    vehicleList["vehicleList:<br/>1. vehicle1<br/>2. vehicle2..."]

    catalogs <--> findPartReferences
    catalogs --> catalogList
    catalogList --> getCatalogInfo
    catalogList --> findVehicle
    catalogList -.-> findByPlateNumber
    getCatalogInfo --> catalogInfo
    catalogInfo -.-> findByPlateNumber
    catalogInfo --> findApplicableVehicles
    catalogInfo --> getOperationForm
    getOperationForm --> operationForm
    operationForm --> findVehicleOperation

    findVehicle --> vehicleList
    findByPlateNumber --> vehicleList
    findApplicableVehicles --> vehicleList
    findVehicleOperation --> vehicleList
```

## Vehicle phase — navigate from a chosen vehicle to its parts

```mermaid
flowchart TD
    vehicleList["vehicleList<br/>(from Catalog phase)"]
    getVehicleInfo(("getVehicleInfo"))
    vehicleInfo["VehicleInfo"]
    getNavigationTree(("getNavigationTree"))
    categoriesTree["CategoriesTree"]
    getUnits(("getUnits"))
    unitList["unitList:<br/>1. unit1<br/>2. unit2..."]
    getGroups(("getGroups"))
    groupsTree["GroupsTree"]
    getGroupParts(("getGroupParts /<br/>getGroupPartsAll"))
    categories["categories:<br/>1. unit1<br/>2. unit2..."]
    getPartApplicability(("getPartApplicability<br/>(PartNumber)"))
    getUnitInfo(("getUnitInfo"))
    unitInfo["UnitInfo"]
    getUnitParts(("getUnitParts"))
    getAllParts(("getAllParts<br/>(WithNames)"))
    partsList["PartsList"]

    vehicleList --> getVehicleInfo
    getVehicleInfo --> vehicleInfo

    vehicleInfo --> getNavigationTree
    vehicleInfo --> getGroups
    vehicleInfo --> getPartApplicability
    vehicleInfo --> getAllParts

    getNavigationTree --> categoriesTree
    categoriesTree --> getUnits
    getUnits --> unitList

    getGroups --> groupsTree
    groupsTree --> getGroupParts
    getGroupParts --> categories
    getGroupParts -.-> getUnits

    getPartApplicability --> categories

    unitList --> getUnitInfo
    categories --> getUnitInfo
    getUnitInfo --> unitInfo
    unitInfo --> getUnitParts
    getUnitParts --> partsList
    getAllParts --> partsList
```

## Filtration pattern (applies inside many of the calls above)

Any call that accepts `filterValues`/`currentFilterState` (e.g.
`getVehicleInfo`, `getNavigationTree`, `getUnits`) can optionally be refined
through `getFilter`, which can be called repeatedly to narrow the result
further before continuing to the next step.

```mermaid
flowchart TD
    prevStep["&lt;previous step&gt;<br/>result1<br/>result2"]
    getFilter(("getFilter"))
    filterForm["Filter Form"]
    nextStep["&lt;next step&gt;<br/>result1<br/>result2"]

    prevStep --> getFilter
    getFilter --> filterForm
    filterForm --> nextStep
    filterForm --> getFilter
```

## Reading the two phases together

1. **Catalog phase** ends once a single vehicle is identified — by VIN
   (`findVehicle`), plate number (`findByPlateNumber`), part number
   (`findPartReferences` → pick a catalog → `findApplicableVehicles`), or
   step-by-step wizard (`getOperationForm` → `findVehicleOperation`). All
   four roads converge on the same `vehicleList`.
2. **Vehicle phase** starts from one `vehicle` entry's `getVehicleInfo` link
   and forks into three independent ways to reach parts: by category tree
   (`getNavigationTree` → `getUnits`), by group tree (`getGroups` →
   `getGroupParts`/`getGroupPartsAll`), or directly by a known part number
   already inside this vehicle (`getPartApplicability`) — all three land on
   the same `categories`/`unitList` shape feeding `getUnitInfo`/`getUnitParts`.
   `getAllParts` is a shortcut that skips the tree entirely and returns
   every part in the vehicle in one flat `PartsList`.
