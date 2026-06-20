# OEM REST API

The OEM REST API allows to use the OEM Service which is a system for vehicle identification and searching for vehicle spare parts in the
catalogs of the original details.
The user (or the customer) can use the OEM REST API with its own credentials via the HTTP Basic authentication.processingTasks.
The REST API Service follows standard HTTP agreements for response codes: 200 (OK), 400 (Bad Request), etc.
The OEM REST API includes the following functions and also schemas which are used in these functions as refs (and also you can see list
of errors that can occur while working with service):

## Functions

GET /restApi/v2/whoAreMeInfo
POST /restApi/v2/catalogs
POST /restApi/v2/getCatalogShort
POST /restApi/v2/getCatalogInfo
POST /restApi/v2/findVehicle
POST /restApi/v2/findVehicleOperation
POST /restApi/v2/getOperationForm
POST /restApi/v2/findPartReferences
POST /restApi/v2/findByPlateNumber
POST /restApi/v2/findApplicableVehicles
POST /restApi/v2/getVehicleInfo
POST /restApi/v2/getNavigationTree
POST /restApi/v2/getUnits
POST /restApi/v2/getFilter
POST /restApi/v2/getUnitInfo
POST /restApi/v2/getUnitParts
POST /restApi/v2/getGroups
POST /restApi/v2/getGroupParts
POST /restApi/v2/getGroupPartsAll
POST /restApi/v2/getPartApplicability

## Schemas

AttrNodeV2
BaseSysProperty
CatalogInfoResponseV2
CatalogInfoV2Dto
CatalogListV2Dto
CatalogShortResponseV2
CatalogShortV2Dto
CatalogV2Dto
CategoryNodeV2Dto
CategoryShortV2Dto
CheckboxV2
CustomerDto
ErrorDtoV2
ExampleValueV2
FieldV2
FormV2Dto
FormValueV2
GroupNodeV2Dto
ImageMapAreaV2Dto
ImageMapV2Dto
InputFieldV2
LinkV2Dto
MeasuredValue
NavigationLinkV2Dto
OptionV2
PartReferencesListV2Dto
PartReferencesV2Dto
PartsByCategoryV2Dto
PartsByUnitV2Dto
PartSectionsListV2Dto
PartSectionV2Dto
PartsByUnitV2Dto
PartShortListV2Dto
PartShortV2

PartsListByCategoryV2Dto
PartV2Dto
SelectV2
VehicleShortV2Dto
VehicleListV2Dto
VehicleV2Dto
UnitShortListV2Dto
UnitShortV2Dto
UnitV2Dto

## Errors

Functions are represented with the schema of request body, the response schema and the examples of using the function in JSON format:
the previous step. the request and the response.
For using a function it is often enough to know token. Token is a set of previous parameters which includes necessary parameters for a
request. While a customer makes search inside a vehicle, he can also choose different values specifying vehicle parameters: "formValues"
and "filterValues". Forms and filters are quite alike, but filters work like HTTP cookies within the vehicle, so they will be specified in the
following requests. A customer can specify filterValues in a lot of requests – for example, instead of "List units" a customer might get a link
for filtration and specifying parameters as a filtration form. If parameters are enough, a customer goes to the next request.
In the response you can see datatype which points out the structure and subject of data and the data itself, for example the array of vehicles
or brands. If filters were taken into account, the response will include a current state of filters as an encoded string ), so w("currentFilterState"i
th the new request a customer will send the same filter state which was specified earlier. The difference with the token is that the token
contains identificational parameters of a vehicle, while currentFilterState contains parameters specified by a customer.
Data can also include:
A block named "links" which shows where user can redirect from this request. Links are defined by an action that is a name of the
following function, a label – its brief definition and token with necessary parameters for the following request.
A block named "navigationLinks" which is similar to "links" but it appears to be navigational for categories and groups of a vehicle.
The block also includes a 'code' parameter, such as "GROUPS" for "getGroups" and "MAIN" for "getNavigationTree".
A block named "forms",  It also contains "label" and "action" or "". "Action" allows to relevant for forms on the page.updateFormAction
perform operation, while Also this block "updateFormAction" redirects to the following updating and specification of the parameter.
includes "operationName" and "fields" of the form with the parameters, their names and their values. If the field has "type": "select"
and this field is not "selected", there will be a list of values to choose. After redirecting to "updateFormAction" the chosen value will
be added to the token which should be used in the following requests and after this update field will have "selected" : true and will
include the only value for deleting the current choice. So, if you submit "updateFormAction" with this value, the choice of the option
will be cancelled, the field will contain a list of possible values, and token will not contain the chosen option.

## OEM Functions

The specified diagram below represents links and connections between functions as steps of a customer from getting catalogs to getting the
list of vehicle parts.

Also, for operations within a vehicle a filter may be required.
Swagger: <https://oem-api.yqservice.eu/swagger-ui/index.html>
Below you can see documentation for the OEM REST API functions.
GET /restApi/v2/whoAreMeInfo
This function allows to get the user their name and login in the system.
Request example
GET: <https://oem-api.yqservice.eu/restApi/v2/whoAreMeInfo>
Response schema
"CustomerResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CustomerDto"

   }

   }

   }

see also: ,  ErrorDtoV2CustomerDto
Response example

   {

"dataType": "CustomerResponseV2",

   "data": {

   "login": "your_login"

   }

   }

POST /restApi/v2/catalogs
This function allows user to get the list of vehicle catalogs, it shows vehicle brands which are present at the system.
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/catalogs>
Response schema
"CatalogListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CatalogListV2Dto"

   }

   }

   }

see also: ,  ErrorDtoV2CatalogListV2Dto

Response example

   {

"dataType": "CatalogListResponseV2",

   "data": {

   "catalogs": [

   {

"token": "AeX1ouz17KrylLelsuLv-_Xs85ORn5CHtrS-qqsAAAAATrAoeQ==",
"name": "ABARTH",
"brand": "ABARTH",
"archived": false,

   "links": [

   {

"action": "getCatalogInfo",
"label": "Search in catalog",

   "token"

"AXxsO3VsdTNrDS48K3t2Ymx1agoIBgkeLy0nMzIAAAAAg8YU4A=="

   }

   ]

   }

   {

"token": "AbSk872kvfujxeb047O-qqS9otfF0bKy7uf9sKX9_AAAAAAvbhCr",
"name": "Volvo Trucks",
"brand": "VOLVO",
"archived": false,

   "links": [

   {

"action": "getCatalogInfo",
"label": "Search in catalog",
"token": "AbSk872kvfujxeb047O-
qqS9otfF0bKy7uf9sKX9_AAAAAAvbhCr"

   }

   ]

   }

   ]

   "forms": [

   {

"action": "findVehicle",
"label": "Search by VIN OR Frame No",
"operationName": "FINDVEHICLE_V2",

   "fields": [

   {

   "type": "input"

"name": "IdentString",
"label": "VIN OR FrameNo",
"pattern": "^(([A-z0-9]{12}[0-9]{5})|([A-z0-9- ]{3,7}[0-9- ]

   {3,7}))$"

   "examples": [

   {

"description": "VIN example",
"value": "ZFA31200000451262"

   }

   {

"description": "Frame example",
"value": "URJ201-4188425"

   }

   ]

   }

   ]

   }

   {

"action": "findPartReferences",
"label": "Find part references",
"operationName": "FINDPARTREFERENCES_V2",

   "fields": [

   {

   "type": "input"

"name": "PartNumber",
"label": "Part number"

   }

   {

   "type": "select"

"name": "IncludeReplacements",

"label": "Include replacements",

   "options": [

   {

   "value": "true"

"label": "Yes"

   }

   {

   "value": "false"

"label": "No"

   }

   ]

   }

   ]

   }

   {

"action": "findByPlateNumber",
"label": "Find By Plate Number",
"operationName": "FINDVEHICLEBYPLATENUMBER_V2",

   "fields": [

   {

   "type": "input"

"name": "PlateNumber",
"label": "Plate Number"

   }

   {

   "type": "select"

"name": "CountryCode",
"label": "Country Code",

   "options": [

   {

"value": "HR",
"label": "Croatia"

   }

   {

"value": "DK",
"label": "Denmark"

   }

   {

"value": "LV",
"label": "Latvia"

   }

   {

"value": "SK",
"label": "Slovakia"

   }

   {

"value": "SE",
"label": "Sweden"

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getCatalogShort
This function allows to get main brief information about a vehicle catalog (if you want to see detailed information, you should use /getCatalogI
which is decribed below).nfo
Request body
"RequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   }

   }

Response schema
"CatalogShortResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CatalogShortResponseV2"

   }

   }

   }

see also: ,  ErrorDtoV2CatalogShortResponseV2
Example of the previous step

   "links" : [ {

"action" : "getCatalogShort",
"label" : "Brief catalog info",
"token" : "AYiYz4GYgcef-drI34-ClpiBnv788v3q29nTx8YAAAAAxIzYPg=="

   } ]

Request example
POST: /restApi/v2/getCatalogShort: {
"token": "AYiYz4GYgcef-drI34-ClpiBnv788v3q29nTx8YAAAAAxIzYPg=="

   }

Response example

   {

"dataType": "CatalogShortResponseV2",

   "data": {

   "token"

"AW19KmR9ZCJ6HD8tOmpnc31kexsZFxgPPjw2c3wVNzw_NT4kMjYtKwYKCnwkdyRueCsfOix
9ZHs8Y3xXPio4NDA5CjNpemB9cns-
MyoWKyQyNhgbDRseChgXSU9HFxELDAAIa3l7AAAAAHyNzz0=",
"name": "ABARTH",
"brand": "ABARTH",
"archived": false

   }

   }

POST /restApi/v2/getCatalogInfo
This function allows to get information about a vehicle catalog.
Request body
"RequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   }

   }

Response schema
"CatalogInfoResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CatalogInfoV2Dto"

   }

   }

   }

see also: ,  ErrorDtoV2CatalogInfoV2Dto
Example of the previous step

   "links" : [ {

"action" : "getCatalogInfo",
"label" : "Search in catalog",
"token" : "AYiYz4GYgcef-drI34-ClpiBnv788v3q29nTx8YAAAAAxIzYPg=="

   } ]

Request example

POST: /restApi/v2/getCatalogInfo: {
"token": "AYiYz4GYgcef-drI34-ClpiBnv788v3q29nTx8YAAAAAxIzYPg=="

   }

Response example

   {

"dataType": "CatalogInfoResponseV2",

   "data": {

"token": "AYiYz4GYgcef-drI34-ClpiBnv788v3q29nTx8YAAAAAxIzYPg==",
"name": "ABARTH",
"brand": "ABARTH",
"archived": false,

   "forms": [

   {

"action": "findVehicle",
"label": "Search by VIN",
"operationName": "FINDVEHICLE_V2",
"token": "AcDQh8nQyY_XsZKAl8fK3tDJ1ra0urWik5Gbj44AAAAAEuw6SQ==",

   "fields": [

   {

   "type": "input"

"name": "IdentString",
"label": "VIN",
"pattern": "^(([A-z0-9]{12}[0-9]{5})|([A-z0-9- ]{3,7}[0-9- ]

   {3,7}))$"

   "examples": [

   {

"description": "VIN example",
"value": "ZFA31200000451262"

   }

   ]

   }

   ]

   }

   {

"action": "findApplicableVehicles",
"label": "Find applicable vehicles by part number",
"operationName": "FINDAPPLICABLEVEHICLES_V2",
"token": "AVZGEV9GXxlBJwQWAVFcSEZfQCAiLCM0BQcNGRgAAAAA1jWy3w==",

   "fields": [

   {

   "type": "input"

"name": "PartNumber",
"label": "Part number"

   }

   {

   "type": "select"

"name": "IncludeReplacements",
"label": "Include replacements",

   "options": [

   {

   "value": "true"

"label": "Yes"

   }

   {

   "value": "false"

"label": "No"

   }

   ]

   }

   ]

   }

   {

"updateFormAction": "getOperationForm",
"label": "Select vehicle by parameters",
"operationName": "WIZARD",

   "token"

"AWt7LGJ7YiR8Nig6L2F6ezY2fWR7DxYHQVxWe3R9HTgsPjFvaTBjehwYEBkLZTQsb3V6PCw
gKCt_OlUwaHpzfGt6AiAAAAAAHKxhqg==",

   "fields": [

   {

   "type": "select"

   "name": "1"

"label": "Model",

   "options": [

   {

"value": "AfixpLjoAAAAANg2TaU=",
"label": "CINQUECENTO ABARTH"

   }

   {

"value": "AaDp9OmrsQAAAAC9RN5U",
"label": "PUNTO ABARTH"

   }

   ]

   }

   {

   "type": "select"

   "name": "2"

"label": "Catalog",

   "options": [

   {

"value": "AVEYBRhTQAAAAABUE2aj",
"label": "3R | NUOVA 500 ABARTH (2008-2012)"

   }

   {

"value": "AbL75vqwowAAAAAZmyJZ",
"label": "4A | GRANDE PUNTO ABARTH (2007-2010)"

   }

   {

"value": "AdGYhZnSwAAAAAAnezuX",
"label": "4B | PUNTO EVO ABARTH (2010-2012)"

   }

   {

"value": "AVMaBxlQQgAAAABAO6WQ",
"label": "81 | NUOVA PUNTO ABARTH MY2012 (2012-2013)"

   }

   {

"value": "ATR9YH41JQAAAABLHHfL",
"label": "85 | 500 ABARTH MY2012 (2012-....)"

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/findVehicle
This function which allows to find vehicle by VIN or Frame number.
Request body
"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"VehicleListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/VehicleListV2Dto"

   }

   }

   }

see also: ErrorDtoV2, VehicleListV2Dto
Example of the previous step
"action" : "findVehicle",
"label" : "Search by VIN",
"operationName" : "FINDVEHICLE_V2",
"token" : "AYSUw42UjcuT9dbE04OOmpSNkvLw_vHm19Xfy8oAAAAAeS9KDQ==",

   "fields" : [ {

   "type" : "input"

"name" : "IdentString",
"label" : "VIN",
"pattern" : "^(([A-z0-9]{12}[0-9]{5})|([A-z0-9- ]{3,7}[0-9- ]

   {3,7}))$"

   "examples" : [ {

"description" : "VIN example",
"value" : "ZFA31200000451262"

   } ]

   } ]

Request example
POST: /restApi/v2/findVehicle: {
"formValues": [

   {

"name": "IdentString",
"value": "ZFA31200000451262"

   }

   ]

"token": "AYSUw42UjcuT9dbE04OOmpSNkvLw_vHm19Xfy8oAAAAAeS9KDQ=="

   }

Response example

   {

"dataType": "VehicleListResponseV2",

   "data": {

   "vehicles": [

   {

"navigationLinks": [

   {

"action": "getNavigationTree",
"label": "Categories",

   "token"

"AUNTBFtTSgxULi9VTwoXCUJCVVpTL1VPCkhZNhYETxwHLwBPBxgMXFUGU0oMV2ZHTCMfGAI
yHxMQChwYPDE-
OFNcVTZJUlsdHxBUS1I0M2FnbklEVQtdUgEcTAQAUwsrVBgUK1cSehhEQU9ELVJbKQpVSRUs
VUwKLFUYSVZ-
EAQWKlNKDCkKRVsFLxQZFSxVT3QECSMsVVotUhQaRElPAyxVTC1SQ0UaehhdLFUTHxceG015
VB4sVUwtUkZBEBALRkArVF0sVRhHSE4ZLFVMLVJGR3QEFi1SDhMQAitXEnoYQ0BHTy1SWykK
RVIQAwQfAi8ZGnQEAC1SLTAwQ0ZHGBYKQUBDQ0BCQUd0BBYtUgETGRkUGU15VB4sVUwtUkdC
GRQCREVOKlNcK1dFUEktUk0qU0FCRRkTD0FARkZBQCtXBHoYGBQrVEssVUR0BBYtUhMEGAYS
KQocZlMjK1RdLFURSV9lHhYoGx4eAx10BAAtUkVPLVIKCFUERwAAAABuKc36",
"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"Aa296rW9pOK6wMG7oeT556ysu7S9wbuh5Ka32PjqofLpwe6h6fbisrvovaTiuYipos3x9uz
c8f3-5PL22MzWzc_Nu7fki7Xr__X3-LyjuYWOnd7Koay947W5sKGwvaS748O88P-
a6u7DvKypp6zFueqU9uzt_cS9pOLH5KW179r47P7Cu6G9lPb8_-3H_PH9x-
TyiL2ty8S9ssW5pae48OvrxL2kxbny-ObDvLXEvfv3_K-mscDw9sS9pMW59_zsqa-
uqMO8tcfkpbvx6vHEvaTFuff6iL2yxbrm-_jpmuruw7yrqK-

nxbnqlPb89vjr7PfqxKiniL2kxbrF2Nio9_rkr66pqKurqKnw-
oi9ssW66fvx8qWkscDw9sS9pMW59v_lraasrabCu7ea6rnp7cW6pcK7qvP45aqrqaiurqmrm
ur4w7zw_MO8o8fk-Yi9ssW6--
zw7aOU9qXCu8vDvLXH5Ky15sH2_sDz9vWyoIi9pMW6rafFubu1qb3jAAAAAPiO-Rw=",
"code": "GROUPS"

   }

   ]

"type": "UNDEFINED",
"brand": "ABARTH",
"model": "CINQUECENTO ABARTH [NUOVA 500 ABARTH (2008-2012)]",

   "attributes": [

   {

   "code": "model"

"label": "Model",

   "values": [

   "3R"

   ]

   "type": "simple"

   }

   {

"code": "MVS",
"label": "MVS",

   "values": [

   "150155001000"

   ]

   "type": "simple"

   }

   {

"code": "MVSDesc",
"label": "MVSDesc",

   "values": [

   "1.4 16V L5 ABARTH GS.5M-I/CE"

   ]

   "type": "simple"

   }

   {

"code": "engineNo",
"label": "engineNo",

   "values": [

   "1486170"

   ]

   "type": "simple"

   }

   {

   "code": "date"

"label": "Vehicle date",

   "values": [

   "29/12/2009"

   ]

   "type": "simple"

   }

   {

   "code": "displacement"

   "label": "displacement"

   "values": [

   "1368 PT (CC1.4)"

   ]

   "type": "simple"

   }

   {

   "code": "power"

   "label": "power"

   "values": [

   "1.4 (KW99)"

   ]

   "type": "simple"

   }

   {

"code": "bodyworkType",
"label": "bodyworkType",

   "values": [

   "BN.W/ REAR END DOOR (TC2V)"

   ]

   "type": "simple"

   }

   {

   "code": "fuel"

   "label": "fuel"

   "values": [

   "PETROL (CMBBZ)"

   ]

   "type": "simple"

   }

   {

   "code": "trimlevel"

   "label": "trimlevel"

   "values": [

   "LIV. 5 (ABARTH) (LL5)"

   ]

   "type": "simple"

   }

   {

   "code": "trimcolor"

"label": "Interior color",

   "values": [

   "CAP TS-823/B BLACK SOFT TOP, BLACK SPOILER"

   "PAN-808 BLACK IMITATION LEATHER"

   "SED-808 BLACK LEATHER"

   "SED-402 BLACK LEATHER"

   ]

   "type": "simple"

   }

   {

   "code": "drive"

   "label": "drive"

   "values": [

   "LHD"

   ]

   "type": "simple"

   }

   {

"code": "otherFeatures",
"label": "otherFeatures",

   "values": [

   "(ASPIRATED/TURBO): TURBO (A/TTRB)"

   "MARKET TRIM LEVEL: ITALY/CENTRAL EUROPE (AM00)"

   "EMISSIONS LEVEL: EEC LIM. STAGE 5 (ECOCF5)"

   "DOOR OPENING/CLOSING REMOTE CONTROL (008)"

   "STEERING WHEEL ADJUSTMENT (011)"

   "FRONT ELECTRIC WINDOWS (028)"

   "HEATED REAR WINDOW (029)"

   "ELECTRICALLY ADJUSTABLE WING MIRRORS WITH DEMISTER

## (041)"

   "SPEEDOMETER (050)"

   "TINTED WINDOWS (070)"

   "FOG LIGHT (097)"

   "REAR WINDOW WIPER (101)"

   "ELECTRIC POWER STEERING (112)"

   "CLIMATE CONTROL 2 (140)"

   "DRIVER SIDE KNEE BAG (150)"

   "SPLIT REAR SEAT (195)"

   "ELECTRIC DOOR LOCKING (228)"

   "VEHICLE DYNAMIC CONTROL (VDC) (392)"

   "STEERING WHEEL WITH LEATHER LINING VENTILATED RIM (44P)"

   "TIRE INFLATION/REPAIR KIT (FIX & GO) (499)"

   "ALLOY WHEELS EXTRA SERIES 12 (4AY)"

   "PORTUGUESE (EUROPE) LANGUAGE CUSTOM. (4FZ)"

   "SPECIFIC PASSENGER SEAT (4GQ)"

   "CONVERGENCE C1 WITH MEDIA PLAYER JACK (4J3)"

   "PANDEMONIUM KIT (4KM)"

   "ABARTH KIT (4SQ)"

   "PLATE IN VARIOUS LANGUAGES ZONE 1 (4XA)"

   "BRANDED HI-FI AUDIO SYSTEM 2 (4YG)"

   "AIRBAG (500)"

   "PASSENGER AIRBAG (502)"

   "FRONT SIDE BAG (505)"

   "PROVISION FOR PDA (54K)"

   "EURO 5 (5SE)"

   "HEAD BAGS (614)"

   "MECHANICALLY ADJUSTABLE FRONT SEAT (626)"

   "CIGAR LIGHTER (665)"

   "RADIO EXTRA SERIES 2 (717)"

   "UPHOLSTERY - EXTRA SERIES 2 (732)"

   "SPECIFIC BUMPERS (876)"

   "CONFORT KIT 1 (890)"

   "GUIDE IN PORTUGUESE (898)"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "full"

   }

   ]

   "links": [

   {

"action": "getVehicleInfo",
"label": "Vehicle info",

   "token"

"ATgofyAoMXcvVVQuNHFscjk5LiEoVC40cTMiTW1_NGd8VHs0fGN3Jy59KDF3LBA8NWtnY2o
oMS5NFRQAXjM4L3cnLng6OWMwKXdRKGJoUnFnHSg-PTU4Vy4iD38yeW9QLzBwUCw-
PDFOanhsVik2dQ9_Imt_U25lb1AsaQFjOVlQLyZXLm08MS5_eVAvMFcuOmNvHSgnUC9vZWtn
PTgeZGRQLzBXLj9nZXc7PDxRKCdQLD4yL35jUC8wVy4_YQFjJlcudG9qflJxZx0oOTw9M1cu
Ig9_ImJqf35jeFNgPAFjMFcuV0xKPz9hbXE6Ozw5Pzo-
OGEBYyZXLntvY2VtPzgeZGRQLzBXLj5kbHMyPjk0VikgUnEwN3lXLjdWKT07Y2x0Pzs8PDo7
PFJxcR0oYmhRKDFQLGIBYyZXLml4YnprD397VilfUSgnUCw3PDhVZGpSZ2RiejsBYzBXLj8z
Vy5zLiBjdwAAAAB9L2rp"

   }

   ]

   "token"

"AR0NWgUNFFIKcHELEVRJVxwcCwQNcQsRVBYHaEhaEUJZcV4RWUZSAgtYDRRSCTUZEE5CRk8
NFAtoMDElexYdClICC10fHEYVDFJ0DUdNd1RCOA0bGBAdcgsHKloXXEp1ChVVdQkbGRRrT11
JcwwTUCpaB05adktASnUJTCRGHHx1CgNyC0gZFAtaXHUKFXILH0ZKOA0CdQpKQE5CGB07QUF
1ChVyCxpCQFIeGRl0DQJ1CRsXCltGdQoVcgsaRCRGA3ILUUpPW3dUQjgNHBkYFnILBypaB0d
PWltGXXZFGSRGFXILcmlvGhpESFQfHhkcGh8bHUQkRgNyC15KRkBIGh07QUF1ChVyCxtBSVY
XGxwRcwwFd1QVElxyCxJzDBgeRklRGh4ZGR8eGXdUVDgNR010DRR1CUckRgNyC0xdR19OKlp
ecwx6dA0CdQkSGR1wQU93QkFHXx4kRhVyCxoWcgtWCwVGUgAAAAB_MLf1"

   }

   ]

   }

   }

POST /restApi/v2/findVehicleOperation
This is a function for searching a vehicle, the alternative search method of vehicle identification specific for catalog.
Request body
"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"VehicleListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/VehicleListV2Dto"

   }

   }

   }

see also: , ErrorDtoV2VehicleListV2Dto
Example of the previous step

   {

"dataType": "OperationFormResponseV2",

   "data": {

"action": "findVehicleOperation",
"updateFormAction": "getOperationForm",
"label": "WIZARD",
"operationName": "WIZARD",
"description": "WIZARD Form",

   "token"

"AQ0dSgQdBEIaUE5cSQccHVBQGwIdaXBhJzowHRIbe15KWFcJD1YFHH51YHFpCVZZTA8HG0U
THF9JC0pOZEUbVl5TXBlcSjlwenx0HRIbTQcEAVocAxp-
enh2RBUpExxaSkZOTRlcM1ZycX19cxwVGT8tNW0cZEUAAAAA5VJxQw==",

   "fields": [

   {

   "type": "select"

"name": "MODEL",
"label": "Model",

   "options": [

   {

"value": "AZrTvqfp5IwAAAAAIgxKJw==",
"label": "ADAM",
"selected": true

   }

   ]

   }

   {

   "type": "select"

"name": "YEAR",
"label": "Model year",

   "options": [

   {

"value": "AWwlSHkyfQAAAAAJRy2U",
"label": "All"

   }

   ]

   }

   ]

   }

   }

Request example
POST: /restApi/v2/findVehicleOperation: {
"formValues": [{
"name":"MODEL",
"value": "AZrTvqfp5IwAAAAAIgxKJw=="

   }]

   "token"

"AQ0dSgQdBEIaUE5cSQccHVBQGwIdaXBhJzowHRIbe15KWFcJD1YFHH51YHFpCVZZTA8HG0U
THF9JC0pOZEUbVl5TXBlcSjlwenx0HRIbTQcEAVocAxp-
enh2RBUpExxaSkZOTRlcM1ZycX19cxwVGT8tNW0cZEUAAAAA5VJxQw=="

   }

Response example

   {

"dataType": "VehicleListResponseV2",

   "data": {

   "vehicles": [

   {

"navigationLinks": [

   {

"action": "getNavigationTree",
"label": "Categories",

   "token"

"AU1dClVdRAJaICFbQQQZB0xMW1RdIVtBBEllKiQgVSAHIElvCRYCUlsIXUQCWWhJQi0RFgw
8ER0eBBIWMj8wNl1SWzhHXFUTER5aRVw-
NnlnZE1OSEBPR1sGCgpCFhpbQl0FJVlDdBZFT0pNTk1VJwRYaF1EJVo4MyY0dnQWAlwEAAAA

## AH2H0KY="

"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"AVREE0xEXRtDOThCWB0AHlVVQk1EOEJYHVB8Mz05TDkeOVB2EA8bS0IRRF0bQHFQWzQIDxU
lCAQHHQsPITUvNDY0Qk4dckwSBgwOAUVaQHh8cik3UlFXX1BbHUwBRBEJBURdQhljE0g6RVp
QVVJRURNtDxY7Qls6RScvYH59OkUdQxsAAAAA9Tj6xQ==",
"code": "GROUPS"

   }

   ]

"type": "PASSENGER",
"brand": "OPEL",
"model": "ADAM (M13)",

   "attributes": [

   {

   "code": "model_year"

   "label": "model_year"

   "values": [

"All"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "full"

   }

   ]

   "links": [

   {

"action": "getVehicleInfo",
"label": "Vehicle info",
"token": "AZSE04yEnduD-fiCmN3A3pWVgo2E-IKY3ZC88_35jPne-
ZC20M_bi4LRhJ3bgLyQmcfLz8aEnYLlsq6i9pWQkJ6XmYCC3c_QzsSDnIXb_t2UsYSdkZKTl
pOOo9Od-oWa_YTg7f2wobGE2oLcAAAAAPG9mkM="

   }

   ]

"token": "AbKi9aqiu_2l396kvvvm-LOzpKui3qS--
7aa1dvfqt_437aQ9un9raT3orv9ppq2v-Ht6eCiu6TDlIiE0LO2trixv6ak--
n26OKluqP92Puyl6K7t7S1sLWohfW73KO826LGy9uWh5ei_KT6AAAAACDiaoo="

   }

   ]

   }

   }

POST /restApi/v2/getOperationForm
This function allows to update form for extra fields on multistep detalisation of search parameters.
Request body
"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"OperationFormResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/FormV2Dto"

   }

   }

   }

see also: ErrorDtoV2, FormV2Dto

Example of the previous step
"updateFormAction" : "getOperationForm",
"label" : "WIZARD",
"operationName" : "WIZARD",
"description" : "WIZARD Form",

   "token"

"AT0tejQtNHIqYH5seTcsLWBgKzItWUBRFwoALSIrS256aGc5P2Y1LE5FUEFZOWZpfD83K3U
jLG95O3p-VHUrZm5jbClseglASkxELSIrfTc0MWosMypOSkhGdCUZIyxqenZ-
fSlsA2ZCQU1NQyxUdgAAAABku_VJ",

   "fields" : [ {

   "type" : "select"

"name" : "MODEL",
"label" : "Model",

   "options" : [ {

"value" : "ATpzHgdJRCwAAAAAp_WfOw==",
"label" : "ADAM"

   }, ... {

"value" : "Af-2wMeLhZmL7eSf8KyzpAAAAADwLwfY",
"label" : "ZAFIRA (T98)"

   } ]

   } ]

Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getOperationForm>: {

   "token"

"AT0tejQtNHIqYH5seTcsLWBgKzItWUBRFwoALSIrS256aGc5P2Y1LE5FUEFZOWZpfD83K3U
jLG95O3p-VHUrZm5jbClseglASkxELSIrfTc0MWosMypOSkhGdCUZIyxqenZ-
fSlsA2ZCQU1NQyxUdgAAAABku_VJ",
"formValues": [

   {

"name": "MODEL",
"value": "ATpzHgdJRCwAAAAAp_WfOw=="

   }

   ]

   }

Response example

   {

"dataType": "OperationFormResponseV2",

   "data": {

"action": "findVehicleOperation",
"updateFormAction": "getOperationForm",
"label": "WIZARD",
"operationName": "WIZARD",
"description": "WIZARD Form",

   "token"

"AQISRQsSC00VX0FTRggTEl9fFA0SZn9uKDU_Eh0UdFFFV1gGAFkKE3F6b35mBllWQwAIFEo
cE1BGBEVBa0oUWVFcUxZTRTZ_dXN7Eh0UQggLDlUTDBVxdXd5SxomHBNVRUlBQhZTPFl9fnJ
yfBMaFjAiOmITa0oAAAAAmXq2Yw==",

   "fields": [

   {

   "type": "select"

"name": "MODEL",
"label": "Model",

   "options": [

   {

"value": "AT10GQBOQysAAAAAQW1eyw==",
"label": "ADAM",
"selected": true

   }

   ]

   }

   {

   "type": "select"

"name": "YEAR",
"label": "Model year",

   "options": [

   {

"value": "AbP6l6btogAAAADqzAhL",
"label": "All"

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/findPartReferences
This function allows to find catalogs which include a certain detail.
Request body
"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"PartReferencesResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/PartReferencesListV2Dto"

   }

   }

   }

see also: , ErrorDtoV2PartReferencesListV2Dto
Example of the previous step
"action" : "findPartReferences",
"label" : "Find part references",
"operationName" : "FINDPARTREFERENCES_V2",

   "fields" : [ {

   "type" : "input"

"name" : "PartNumber",
"label" : "Part number"

   } ]

Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/findPartReferences>: {
"formValues": [

   {

"name": "PartNumber",

   "value": "71751448"

   }

   ]

"token": null,
"currentFilterState": ""

   }

Response example

   {

"dataType": "PartReferencesResponseV2",

   "data": {

"partReferences": [

   {

"partNumber": "71751448",
"partName": " ",

   "catalogs": [

   {

"token": "AaKy5auyq-210_Di9aWovLKrtNTW2NfA8fP57ewAAAAAkX9-

## AQ=="

"name": "ABARTH",
"brand": "ABARTH",
"archived": false,

   "links": [

   {

"action": "getCatalogInfo",

"label": "Search in catalog",
"token": "AZ2N2pSNlNKK7M_dypqXg42Ui-vp5-
j_zszG0tMAAAAAA82IAQ=="

   }

   {

"action": "getCatalogShort",
"label": "Brief catalog info",
"token": "AcnZjsDZwIbeuJuJns7D19nA37-
9s7yrmpiShocAAAAAqCrEfw=="

   }

   {

"action": "findApplicableVehicles",
"label": "Find applicable vehicles by part number",
"token": "AfLitfvi-73lkKC0sNfi5qKktOX64_H1rqK69PX-
5ezjhaXt9uevpuT94oKAjdjDs_Tju7oAAAAA7oRnGQ=="

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/findByPlateNumber
That allows to find a vehicle by its registration plate number.
Request body
"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"VehicleListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/VehicleListV2Dto"

   }

   }

   }

see also: , ErrorDtoV2VehicleListV2Dto
Example of the previous step
"action" : "findByPlateNumber",
"label" : "Find By Plate Number",
"operationName" : "FINDVEHICLEBYPLATENUMBER_V2",

   "fields" : [ {

   "type" : "input"

"name" : "CountryCode",
"label" : "Country Code"

   }, {

   "type" : "input"

"name" : "PlateNumber",
"label" : "Plate Number"

   } ]

Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/findByPlateNumber>: {
"formValues": [

   {

"name": "CountryCode",
"value": "SK"

   }

   {

"name": "PlateNumber",
"value": "KS666ER"

   }

   ]

"token": null

   }

Response example

   {

"dataType": "VehicleListResponseV2",

   "data": {

   "vehicles": [

   {

"navigationLinks": [

   {

"action": "getNavigationTree",
"label": "Categories",

   "token"

"AZqK3YKKk9WN9_aMltPO0JubjIOK9oyW07HVkeXh7t_O_IGw3sHVhYzfipPVjr-
elfrGwdvrxsrJ08XB5ejn4YqFjO-Qi4LExsmNkovs4abN05mQn5-

K1IKOh5aHipOM1PSLx8it3dn0i5qfmJibmsDK0PSLgvOK2t3Ird3Z0_WMwsnZ6s2Fnr-
Kk9Xzit_LxJicj831jJX0i9XwraPBxcDK8_T1jJbEyduamILz9PWM2JKjv_SLlPP09Yznp8v
S9PXyjYT18vDTiYrG9fLzipPy8K3dtOro5fmcmJ6awc-5n52bmZv18vDTgr-
K1NPSitQAAAAAxAZy-Q==",
"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"ATsrfCMrMnQsVlctN3JvcTo6LSIrVy03chB0MERAT35vXSARf2B0JC1-
KzJ0Lx4_NFtnYHpKZ2tocmRgTlpAW1lbLSFyHSN9aWNhbio1LxITFTs4Pjc4OC1wfHw0YGwt
NCtzUy85Oh4rMlMsPTg_PGVoczw7UywlVC1-
IzoeKzJ0Uitlbn0UPzZoVC00clQtezU2K2pkalIrMlMvKwIeVSpiZ21UU1FyZHc_MD0_JVRT
UXIqIVVUUywzVFNRchUUPTlTUlUqI1EMAmB_YWFSVVQtNwwCHitfTU9CXjs8YGhyOVI4Ojw-
PFEMAmB0VC1zdHUtcAAAAADFu9n7",
"code": "GROUPS"

   }

   ]

"type": "UNDEFINED",
"brand": "BMW",
"model": "X6 40dX",

   "attributes": [

   {

   "code": "model"

"label": "Model",

   "values": [

   "KV41"

   ]

   "type": "simple"

   }

   {

   "code": "date"

"label": "Vehicle date",

   "values": [

   "31.07.2018"

   ]

   "type": "simple"

   }

   {

   "code": "series_code"

   "label": "series_code"

   "values": [

   "F16"

   ]

   "type": "simple"

   }

   {

   "code": "series_description"

   "label": "series_description"

   "values": [

   "X6 F16"

   ]

   "type": "simple"

   }

   {

   "code": "vin"

   "label": "vin"

   "values": [

   "WBAKV410600Z74563"

   ]

   "type": "simple"

   }

   {

   "code": "destinationregion"

"label": "made for region",

   "values": [

   "ECE"

   ]

   "type": "simple"

   }

   {

   "code": "engine"

"label": "Engine",

   "values": [

"N57Z (3000CC / 230kW)"

   ]

   "type": "simple"

   }

   {

   "code": "transmission"

"label": "Gearbox",

   "values": [

"Automatic"

   ]

   "type": "simple"

   }

   {

   "code": "drive"

   "label": "drive"

   "values": [

   "AWD"

   ]

   "type": "simple"

   }

   {

"code": "bodyStyle",
"label": "bodyStyle",

   "values": [

   "SAC"

   ]

   "type": "simple"

   }

   {

   "code": "framecolor"

"label": "Color",

   "values": [

   "AZURITSCHWARZ METALLIC (S34)"

   ]

   "type": "simple"

   }

   {

   "code": "trimcolor"

"label": "Interior color",

   "values": [

   "LEDER DAKOTA/ELFENBEINWEISS  (LCEW)"

   ]

   "type": "simple"

   }

   {

   "code": "doors"

   "label": "door"

   "values": [

   "5"

   ]

   "type": "simple"

   }

   {

   "code": "steering"

   "label": "steering"

   "values": [

"Left hand drive"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "full"

   }

   ]

   "links": [

   {

"action": "getVehicleInfo",
"label": "Vehicle info",

   "token"

"ASc3YD83LmgwSksxK25zbSYmMT43SzErbgxoLFhcU2JzQTwNY3xoODFiNy5oMw8jKnR4fHU
3LjFTARVsJSUqIyU2bj1uNDdxNikwbkgxeCgefC9IMSYlJCIkenNrJkgxPkk2YGIoHnwvb08
weHVjVS02P0k2KWlJNmV0JCs9eXFPMC9IMWoQHgI3eXp2SUhPM3Z3aC0mIj5JSE8zOCECSUg
xKElITzMHFGokSE9ONzhPTRBgKHx6T05JNilNEB58QlZSWUMgIiF6cm5PIycnIydPTRBgI0k
2bm9oNm4AAAAAcCvhOw=="

   }

   ]

   "token"

"AZGB1omBmN6G_P2HndjF25CQh4iB_Yed2Lremu7q5dTF94q71crejofUgZjehbmVnMLOysO
BmIflt6Pak5OclZOA2IvYgoHHgJ-G2P6Hzp6oypn-h5CTkpSSzMXdkP6HiP-
A1tSeqMqZ2fmGzsPV45uAif-An9__gNPCkp2Lz8f5hpn-
h9ymqLSBz8zA__75hcDB3puQlIj__vmFjpe0__6Hnv_--YWxotyS_vn4gY75-6bWnsrM-
fj_gJ_7pqjK9ODk7_WWlJfMxNj5lZGRlZH5-6bWlf-A2NnegNgAAAAA3xLsfw=="

   }

   ]

   }

   }

POST /restApi/v2/findApplicableVehicles
This function allows to find out in which vehicles the detail is used and find vehicles by this detail.
Request body

"FormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

   }

   }

see also: FormValueV2
Response schema
"VehicleListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/VehicleListV2Dto"

   }

   }

   }

see also: ErrorDtoV2, VehicleListV2Dto
Example of the previous step
"action" : "findApplicableVehicles",
"label" : "Find applicable vehicles by part number",
"operationName" : "FINDAPPLICABLEVEHICLES_V2",

   "token"

"AdXFktzF3JrCpIeVgtLfy8Xcw6equaPRjoGU19_DncvEgpHHwNjF3LrCroiCj8vUybWDkYy
GhYSO297YlMS8nQAAAAAtkrpW",

   "fields" : [ {

   "type" : "input"

"name" : "PartNumber",
"label" : "Part number"

   }, {

   "type" : "select"

"name" : "IncludeReplacements",
"label" : "Include replacements",

   "options" : [ {

"value" : "Ad2UzNaai8sAAAAAPKpx9w==",
"label" : "Yes"

   }, {

"value" : "Aa_mrLfx7_64AAAAAOLEWBA=",

"label" : "No"

   } ]

   } ]

Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/findApplicableVehicles>: {
"formValues": [

   {

"name": "PartNumber",

   "value": "84168680"

   }

   ]

   "token"

"AdXFktzF3JrCpIeVgtLfy8Xcw6equaPRjoGU19_DncvEgpHHwNjF3LrCroiCj8vUybWDkYy
GhYSO297YlMS8nQAAAAAtkrpW"

   }

Response example

   {

"dataType": "VehicleListResponseV2",

   "data": {

   "vehicles": [

   {

"navigationLinks": [

   {

"action": "getNavigationTree",
"label": "Categories",
"token": "AZaG0Y6Gn9mB-_qAmt_C3JeXgI-G-
oCa35Db5fPQldOSxOOK0s3ZiYDThp_ZgrOSmfbKzdfnysbF38nN6eTr7YaJgOOch47IysWBn
ofl7aKx3ZSUmpOdh9-M34WGwIeYgd_5gMWh0dWTkpObkon-go2vzZ75gOTp-
uD8347N2QAAAAADt6fc",
"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"AcfXgN_XzojQqqvRy46TjcbG0d7Xq9HLjsGKtKKBxILDlbLbg5yI2NGC186I0-
LDyKebnIa2m5eUjpicsqa8p6Wn0d2O4d-BlZ-dktbJ0-
vv4bfGw8PNxMrT0Y6cg52X0M_WiK2Ox-
LXzsTFxMzF3fCAzqnWya7Xs76u7v6ciNaOAAAAAJfzAW8=",
"code": "GROUPS"

   }

   ]

"type": "PASSENGER",
"brand": "BUICK",
"model": "Lacrosse (4Z1)",

   "attributes": [

   {

   "code": "model_year"

   "label": "model_year"

   "values": [

   "2018"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "basic"

   }

   ]

   "links": [

   {

"action": "getVehicleInfo",
"label": "Vehicle info",
"token": "AXJiNWpiez1lHx5kfjsmOHNzZGtiHmR-
O3Q_ARc0cTd2IAduNik9bWQ3Yns9Zlp2fyEtKSBie2QDVEhJcnF3f3B4ZDk1NX0pJWR9Yjoa
ZnxLKXp2cXZ4d2oYO2dXYnsaZQcMGQZFNXZiPAAAAADKPWfI"

   }

   ]

"token": "Ab2t-qWttPKq0NGrsfTp97y8q6St0aux9Lvwztj7vvi578ih-
ebyoqv4rbTyqZW5sO7i5u-ttKvMm4eGvb64sL-3q_b6-
rLm6quyrfXVqbOE5rW5vrm3uKXX9KiYrbTVqsjD1smK-rmt8wAAAAAlNTao"

   }

   {

"navigationLinks": [

   {

"action": "getNavigationTree",
"label": "Categories",
"token": "AYKSxZqSi82V7-6UjsvWyIODlJuS7pSOy9W_0unk4df5m-
DdxtnNnZTHkovNlqeGjeLe2cPz3tLRy93Z_fD_-ZKdlPeIk5rc3tGVipPx-
balyYCAjoeJk8uYy5GS1JOMlcvtlNG1xcGBgIaEhIOa6MuXp5KL6pX3_On2tcWGkswAAAAAb
FM0jA==",
"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"AdLClcrC253Fv77E3puGmNPTxMvCvsTem4Xvgrm0sYepy7CNlomdzcSXwtudxvfW3bKOiZO
jjoKBm42Jp7OpsrCyxMib9MqUgIqIh8Pcxv769KLT1tbY0d_GxJuJloiCxdrDnbib0vfC29f
W0NLS1pXriZC9xN28w6Gp5vX3wpzEmgAAAADE7dBP",
"code": "GROUPS"

   }

   ]

"type": "PASSENGER",
"brand": "BUICK",
"model": "Lacrosse (4Z1)",

   "attributes": [

   {

   "code": "model_year"

   "label": "model_year"

   "values": [

   "2019"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "basic"

   }

   ]

   "links": [

   {

"action": "getVehicleInfo",
"label": "Vehicle info",

   "token"

"AU1dClVdRAJaICFbQQQZB0xMW1RdIVtBBBpwHSYrLhg2VC8SCRYCUlsIXUQCWWVJQB4SFh9
dRFs8a3d2TU5IQE9HWwYKCkIWGltCXQUlWUN0FkVPSEhMSktXegpEI1xDJF05NCRkdBYCXAQ
AAAAA7rBQrg=="

   }

   ]

   "token"

"AV9PGEdPVhBIMjNJUxYLFV5eSUZPM0lTFghiDzQ5PAokRj0AGwQQQEkaT1YQS3dbUgwABA1
PVkkueWVkX1xaUl1VSRQYGFAECElQTxc3S1FmBFddWlpeWFlFaBhWMU5RNk8rJjZ2ZgQQThY
AAAAAB9qYKw=="

   }

   ]

   }

   }

POST /restApi/v2/getVehicleInfo
This function allows to get information about the vehicle, it shows vehicle characteristics and properties.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema

"VehicleResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/VehicleV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, VehicleV2Dto
Example of the previous step
"action" : "getVehicleInfo",
"label" : "Vehicle info",

   "token"

"ARoKXQIKE1UNd3YMFlNOUBsbDAMKdgwWU00AW2ZMa3sfHnkoXkFVBQxfChNVDjIeF0lFQUg
KEwxvNzYifBEaDVUFDFoYG0ESC1VzCkBKcFNFPwocHxcadQwALV0QW01yDRJScg4cHhNsSFp
OdAsUVy1dAEldcUxHTXIOSyNBG3tyDQR1DE8eEwxdW3INEnUMGEFNPwoFcg1NR0lFHxo8RkZ
yDRJ1DB1FR1UZHh5zCgVyDhwQDVxBcg0SdQwdQyNBBHUMVk1IXHBTRT8KGx4fEXUMAC1dAEB
IXVxBWnFCHiNBEnUMdW5oHR1DT1MYGR4bHRgcGkMjQQR1DFlNQUdPHRo8RkZyDRJ1DBxGTlE
QHBsWdAsCcFMSFVt1DBV0Cx8ZQU5WHRkeHhgZHnBTUz8KQEpzChNyDkAjQQR1DEtaQFhJLV1
ZdAt9cwoFcg4VHhp3RkhwRUZAWBkjQRJ1DB0RdQxRDAJBVQAAAAC59ZCB"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getVehicleInfo>: {

   "token"

"ARoKXQIKE1UNd3YMFlNOUBsbDAMKdgwWU00AW2ZMa3sfHnkoXkFVBQxfChNVDjIeF0lFQUg
KEwxvNzYifBEaDVUFDFoYG0ESC1VzCkBKcFNFPwocHxcadQwALV0QW01yDRJScg4cHhNsSFp
OdAsUVy1dAEldcUxHTXIOSyNBG3tyDQR1DE8eEwxdW3INEnUMGEFNPwoFcg1NR0lFHxo8RkZ
yDRJ1DB1FR1UZHh5zCgVyDhwQDVxBcg0SdQwdQyNBBHUMVk1IXHBTRT8KGx4fEXUMAC1dAEB
IXVxBWnFCHiNBEnUMdW5oHR1DT1MYGR4bHRgcGkMjQQR1DFlNQUdPHRo8RkZyDRJ1DBxGTlE
QHBsWdAsCcFMSFVt1DBV0Cx8ZQU5WHRkeHhgZHnBTUz8KQEpzChNyDkAjQQR1DEtaQFhJLV1
ZdAt9cwoFcg4VHhp3RkhwRUZAWBkjQRJ1DB0RdQxRDAJBVQAAAAC59ZCB",
"formValues": [],
"currentFilterState": ""

   }

Response example

   {

"dataType": "VehicleResponseV2",

   "data": {

"navigationLinks": [

   {

"action": "getNavigationTree",

"label": "Categories",
"token": "AYiYz5CYgcef5eSehMHcwomJnpGY5J6Ewd-SyfTe-
emNjOu6zNPHl57NmIHHnK2Mh-jU08n51NjbwdfT9_r185iXnv2CmZDW1NufgJn_-
KqspYKPnsCWmcrXh8_LmMDgn9Pf4JzZsdOPioSP5pmQ4sGegt7nnofB557Tgp2128_d4ZiBx
-LBjpDO5N_S3ueehL_PwujnnpHmmd_Rj4KEyOeeh-
aZiI7RsdOW557Y1NzV0Iayn9XnnofmmY2K29vAjYvgn5bnntOMg4XS556H5pmNjL_P3eaZxd
jbyeCc2bHTiIuMhOaZkOLBjpnbyM_UyeTS0b_Py-
aZ5vv7iI2M093BiouIiIuJioy_z93mmcrY0tLf0oayn9XnnofmmYyJ0t_Jj46F4ZiX4JyOm4
LmmYbhmIqJjtLYxIqLjY2Ki-Ccz7HT09_gn4Dnno-_z93mmdjP083Z4sHXrZjo4J-
W557agpSu1d3j0NXVyNa_z8vmmY6E5pnBw57PjAAAAADEiXN6",
"code": "MAIN"

   }

   {

"action": "getGroups",
"label": "Groups",

   "token"

"AdnJnsHJ0JbOtLXP1ZCNk9jYz8DJtc_VkI7DmKWPqLjc3brrnYKWxs-
cydCWzfzd1rmFgpiohYmKkIaCrLiiubu5z8OQ_8Gfi4GDjMjXzfH66aq-
1djJl8HNxNXEydDPl7fIhIvunpq3yNjd09ixzZ7ggpiZibDJ0JazkNHBm66MmIq2z9XJ4IKI
i5mziIWJs5CG_MnZv7DJxrHN0dPMhJ-fsMnQsc2GjJK3yMGwyY-
DiNvSxbSEgrDJ0LHNg4iY3dva3LfIwbOQ0c-
FnoWwydCxzYOO_MnGsc6Sj4yd7p6at8jf3NvTsc2e4IKIgoyfmIOesNzT_MnQsc6xrKzcg46
Q29rd3N_f3N2EjvzJxrHOnY-
FhtHQxbSEgrDJ0LHNgouR2dLY2dK2z8Puns2dmbHO0bbP3oeMkd7f3dza2t3f7p6Mt8iEiLf
I17OQjfzJxrHOj5iEmdfggtG2z7-
3yMGzkNjBkrWCirSHgoHG1PzJ0LHO2dOxzc_B3cmXAAAAAD3FzFI=",
"code": "GROUPS"

   }

   ]

"type": "UNDEFINED",
"brand": "ABARTH",
"model": "CINQUECENTO ABARTH [NUOVA 500 ABARTH (2008-2012)]",

   "attributes": [

   {

   "code": "model"

"label": "Model",

   "values": [

   "3R"

   ]

   "type": "simple"

   }

   {

"code": "MVS",
"label": "MVS",

   "values": [

   "150155001000"

   ]

   "type": "simple"

   }

   {

"code": "MVSDesc",
"label": "MVSDesc",

   "values": [

   "1.4 16V L5 ABARTH GS.5M-I/CE"

   ]

   "type": "simple"

   }

   {

"code": "engineNo",
"label": "engineNo",

   "values": [

   "1486170"

   ]

   "type": "simple"

   }

   {

   "code": "date"

"label": "Vehicle date",

   "values": [

   "29/12/2009"

   ]

   "type": "simple"

   }

   {

   "code": "displacement"

   "label": "displacement"

   "values": [

   "1368 PT (CC1.4)"

   ]

   "type": "simple"

   }

   {

   "code": "power"

   "label": "power"

   "values": [

   "1.4 (KW99)"

   ]

   "type": "simple"

   }

   {

"code": "bodyworkType",
"label": "bodyworkType",

   "values": [

   "BN.W/ REAR END DOOR (TC2V)"

   ]

   "type": "simple"

   }

   {

   "code": "fuel"

   "label": "fuel"

   "values": [

   "PETROL (CMBBZ)"

   ]

   "type": "simple"

   }

   {

   "code": "trimlevel"

   "label": "trimlevel"

   "values": [

   "LIV. 5 (ABARTH) (LL5)"

   ]

   "type": "simple"

   }

   {

   "code": "trimcolor"

"label": "Interior color",

   "values": [

   "CAP TS-823/B BLACK SOFT TOP, BLACK SPOILER"

   "PAN-808 BLACK IMITATION LEATHER"

   "SED-808 BLACK LEATHER"

   "SED-402 BLACK LEATHER"

   ]

   "type": "simple"

   }

   {

   "code": "drive"

   "label": "drive"

   "values": [

   "LHD"

   ]

   "type": "simple"

   }

   {

"code": "otherFeatures",
"label": "otherFeatures",

   "values": [

   "(ASPIRATED/TURBO): TURBO (A/TTRB)"

   "MARKET TRIM LEVEL: ITALY/CENTRAL EUROPE (AM00)"

   "EMISSIONS LEVEL: EEC LIM. STAGE 5 (ECOCF5)"

   "DOOR OPENING/CLOSING REMOTE CONTROL (008)"

   "STEERING WHEEL ADJUSTMENT (011)"

   "FRONT ELECTRIC WINDOWS (028)"

   "HEATED REAR WINDOW (029)"

   "ELECTRICALLY ADJUSTABLE WING MIRRORS WITH DEMISTER (041)"

   "SPEEDOMETER (050)"

   "TINTED WINDOWS (070)"

   "FOG LIGHT (097)"

   "REAR WINDOW WIPER (101)"

   "ELECTRIC POWER STEERING (112)"

   "CLIMATE CONTROL 2 (140)"

   "DRIVER SIDE KNEE BAG (150)"

   "SPLIT REAR SEAT (195)"

   "ELECTRIC DOOR LOCKING (228)"

   "VEHICLE DYNAMIC CONTROL (VDC) (392)"

   "STEERING WHEEL WITH LEATHER LINING VENTILATED RIM (44P)"

   "TIRE INFLATION/REPAIR KIT (FIX & GO) (499)"

   "ALLOY WHEELS EXTRA SERIES 12 (4AY)"

   "PORTUGUESE (EUROPE) LANGUAGE CUSTOM. (4FZ)"

   "SPECIFIC PASSENGER SEAT (4GQ)"

   "CONVERGENCE C1 WITH MEDIA PLAYER JACK (4J3)"

   "PANDEMONIUM KIT (4KM)"

   "ABARTH KIT (4SQ)"

   "PLATE IN VARIOUS LANGUAGES ZONE 1 (4XA)"

   "BRANDED HI-FI AUDIO SYSTEM 2 (4YG)"

   "AIRBAG (500)"

   "PASSENGER AIRBAG (502)"

   "FRONT SIDE BAG (505)"

   "PROVISION FOR PDA (54K)"

   "EURO 5 (5SE)"

   "HEAD BAGS (614)"

   "MECHANICALLY ADJUSTABLE FRONT SEAT (626)"

   "CIGAR LIGHTER (665)"

   "RADIO EXTRA SERIES 2 (717)"

   "UPHOLSTERY - EXTRA SERIES 2 (732)"

   "SPECIFIC BUMPERS (876)"

   "CONFORT KIT 1 (890)"

   "GUIDE IN PORTUGUESE (898)"

   ]

   "type": "simple"

   }

   ]

"sysProperties": [

   {

   "code": "filter_level"

   "value": "full"

   }

   ]

   "links": [

   {

"action": "getCatalogInfo",
"label": "Search in catalog",
"token": "AZGB1piBmN6G4MPRxpabj4GYh-fl6-TzwsDK3t8AAAAAvm4aMg=="

   }

   {

"action": "getCatalogShort",
"label": "Brief catalog info",
"token": "ARoKXRMKE1UNa0haTR0QBAoTDGxuYG94SUtBVVQAAAAA3eTchg=="

   }

   ]

   "token"

"AWNzJHtzaix0Dg91byo3KWJidXpzD3VvKjR5Ih81EgJmZwBRJzgsfHUmc2osd0tnbjA8ODF
zanUWTk9bBWhjdH1yGzprZ3Y0cm10ND4IEEYkNnMGMj4HYjQhcCQgcysLdDg0C3cyWjhkYW9
kDXJ7CSp1aTUMdWwqDHU4aXZeMCQ2CnNqLAkqZXslDzQ5NQx1b1QkKQMMdXoNcjQ6ZGlvIwx
1bA1yY2U6Wjh9DHUzPzc-
O21ZdD4MdWwNcmZhMDArZmALdH0MdThnaG45DHVsDXJmZ1QkNg1yLjMwIgt3Mlo4Y2Bnbw1y
ewkqZXIwIyQ_Ig85OlQkIA1yDRAQY2ZnODYqYWBjY2BiYWdUJDYNciEzOTk0OW1ZdD4MdWwN
cmdiOTQiZGVuCnN8C3dlcGkNcm0Kc2FiZTkzL2FgZmZhYAt3JFo4ODQLdGsMdWRUJDYNcjMk
OCYyCSo8RnMDC3R9DHUxaX9FPjYIOz4-
Iz1UJCANcmVvDXIqKHUkZ31yIT81cm13c1o4ODQLdGsMdWA5PigNcnsKcyMkMVQkICoMdTsw
IBM0fGdGc2osCnMzNiFXZXU1DHVsDXJkB1QkNg1yNDk9PyInVCQgDXJjZmMMdXlUJH8_Nz44
NA85OlQkIA1yZmJpZmZiOFo4fQx1Oz4-
Iz1UJCANcmZkDXJ7CSp_fzAiC3RrDHVnODYjDXJ7CnMzPzR7dXMiDzk5DXJtCSpcXBBjZmRh
YGdlODIvYGJhZA1yewkqcH85OTQ6NA85OlQkIA1yZ2FgYm9gPT9Gc3wLdDwmJAkqPEZzYWJm
YGViZTg3KmFgC3R9DHU8bFo4awx1Zw1yewkqYmg4JjIKc2oLd1taOH0MdTIwKQg6bll3Pj4j
Pg1ybQkqNCMNciorLHJ7d25qbhAzI3RrcjAwfFB_OTk0OjQZOTNnJDZzNjsiHiB1bypBXwUG
Eh4YExsQQUhcHg8BZHMtAAAAAPDBtZk=",

   "forms": [

   {

"action": "getAllParts",
"label": "List all parts",
"operationName": "GETALLPARTS_V2",

   "token"

"AXRkM2xkfTtjGRhieD0gPnV1Ym1kGGJ4PSNuNQgiBRVxcBdGMC87a2IxZH07YFxweScrLyZ
kfWIBWVhMEn90YztrYjR2dS98ZTsdZC4kHj0rUWRycXl0G2JuQzN-
NSMcY3w8HGBycH0CJjQgGmV6OUMzbiczHyIpIxxgJU0vdRUcY2obYiFwfWIzNRxjfBtidi8j
UWRrHGMjKScrcXRSKCgcY3wbYnMrKTt3cHAdZGscYHJ-
YzIvHGN8G2JzLU0vahtiOCMmMh49K1FkdXBxfxtibkMzbi4mMzIvNB8scE0vfBtiGwAGc3Mt
IT12d3B1c3ZydC1NL2obYjcjLykhc3RSKCgcY3wbYnIoID9-

cnV4GmVsHj18ezUbYnsaZXF3LyA4c3dwcHZ3cB49PVFkLiQdZH0cYC5NL2obYiU0LjYnQzM3
GmUTHWRrHGB7cHQZKCYeKyguNndNL3wbYnN_G2I_YmwvOwAAAAB2acwN",

   "fields": [

   {

   "type": "select"

"name": "WithNames",
"label": "With names",

   "options": [

   {

   "value": "true"

"label": "Yes"

   }

   {

   "value": "false"

"label": "No"

   }

   ]

   }

   ]

   }

   {

"action": "getPartApplicability",
"label": "Part applicability",
"operationName": "GETPARTAPPLICABILITY_V2",

   "token"

"AT0teiUtNHIqUFErMXRpdzw8KyQtUSsxdGonfEFrTFw4OV4PeWZyIit4LTRyKRU5MG5iZm8
tNCtIEBEFWzY9KnIiK30_PGY1LHJULWdtV3RiGC07ODA9UisnCno3fGpVKjV1VSk7OTRLb31
pUywzcAp6J256VmtgalUpbARmPFxVKiNSK2g5NCt6fFUqNVIrP2ZqGC0iVSpqYG5iOD0bYWF
VKjVSKzpiYHI-
OTlULSJVKTs3KntmVSo1Uis6ZARmI1IrcWpve1d0YhgtPDk4NlIrJwp6J2dventmfVZlOQRm
NVIrUklPOjpkaHQ_Pjk8Oj87PWQEZiNSK35qZmBoOj0bYWFVKjVSKzthaXY3OzwxUywlV3Q1
MnxSKzJTLDg-ZmlxOj45OT8-OVd0dBgtZ21ULTRVKWcEZiNSK2x9Z39uCnp-
UyxaVC0iVSkyOT1QYW9XYmFnfz4EZjVSKzo2Uit2KyVmcgAAAADz4zyM",

   "fields": [

   {

   "type": "input"

"name": "PartNumber",
"label": "Part number",
"required": true

   }

   {

   "type": "select"

"name": "IncludeReplacements",
"label": "Include replacements",

   "options": [

   {

   "value": "true"

"label": "Yes"

   }

   {

   "value": "false"

"label": "No"

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getNavigationTree
This function allows to get a list of unit categories in a catalog.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"NavigationTreeResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CategoryNodeV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, CategoryNodeV2Dto
Example of the previous step
"action" : "getNavigationTree",
"label" : "Categories",
"token" : "AbWl8q2lvPqi2Nmjufzh_7S0o6yl2aO5_KWJ0rLO183s-

Oeb8e76qqPwpbz6oZCxutXp7vTE6eXm_OruysfIzqWqo8C_pK3r6eaivaTCxZeRmL-
yo_2rpPfquvL2pf3dou7i3aHkjO6yt7my26St3_yjv-Pao7r82qPuv6CI5vLg3KW8-
t_8p6W12qO626Swsung-
tukrdyl5eD3gbOj49qjutukstGC8uDbpOz29NqjuYLy_bK2t7mytrGy7uD826T8_fqk_AAAA
AAexq0X",
"code" : "MAIN"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getNavigationTree>: {
"token": "AbWl8q2lvPqi2Nmjufzh_7S0o6yl2aO5_KWJ0rLO183s-
Oeb8e76qqPwpbz6oZCxutXp7vTE6eXm_OruysfIzqWqo8C_pK3r6eaivaTCxZeRmL-
yo_2rpPfquvL2pf3dou7i3aHkjO6yt7my26St3_yjv-Pao7r82qPuv6CI5vLg3KW8-
t_8p6W12qO626Swsung-
tukrdyl5eD3gbOj49qjutukstGC8uDbpOz29NqjuYLy_bK2t7mytrGy7uD826T8_fqk_AAAA
AAexq0X",
"currentFilterState": ""

   }

Response example

   {

"dataType": "NavigationTreeResponseV2",

   "data": {

"name": "Categories",

   "children": [

   {

   "token"

"AWZ2IX52bylxCwpwai8yLGdncH92CnBqL3ZaAWEdBB4_KzRIIj0peXAjdm8pck5iazU5PTR
2b3ATS0peAG1mcSl5cCZkZz1udykPdjw2DC85Q3ZgY2tmCXB8USFsJzEOcW4uDnJgYm8QNCY
yCHdoK1EhaD1nDnFuCXBhPDQvYglwfwh3MTF5XHw7MQ5xbglwY19fPXgJcD4iJg5yN189ZWB
iZW1gYmA8My9kCXAuKShwfC9tdjB3aHEvCXA5aV89bglwYmRlDnIhXz0nJjYPdm8pDC9ufiQ
RMyc1CXBqdl89IzxgD3ZvDnI8MihkYw5xeAlwM2x3QDc6Ng92bw5yPlFDdnkOcTkjIQwvOUN
2ZGdjYmxnYD0yL2RlDnF4CXA3f3NANzo2D3ZvDnI8My8Idy8uKXcvAAAAAIMCdSk=",
"name": "100. ENGINE AND SUSPENSION",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AWZ2IX52bylxCwpwai8yLGdncH92CnBqL3ZaAWEdBB4_KzRIIj0peXAjdm8pck5iazU5PTR
2b3ATS0peAG1mcSl5cCZkZz1udykPdjw2DC85Q3ZgY2tmCXB8USFsJzEOcW4uDnJgYm8QNCY
yCHdoK1EhaD1nDnFuCXBhPDQvYglwfwh3MTF5XHw7MQ5xbglwY19fPXgJcD4iJg5yN189ZWB
iZW1gYmA8My9kCXAuKShwfC9tdjB3aHEvCXA5aV89bglwYmRlDnIhXz0nJjYPdm8pDC9ufiQ
RMyc1CXBqdl89IzxgD3ZvDnI8MihkYw5xeAlwM2x3QDc6Ng92bw5yPlFDdnkOcTkjIQwvOUN
2ZGdjYmxnYD0yL2RlDnF4CXA3f3NANzo2D3ZvDnI8My8Idy8uKXcvAAAAAIMCdSk="

   }

   ]

   "children": [

   {

   "token"

"AQ8fSBcfBkAYYmMZA0ZbRQ4OGRYfYxkDRh8zaAh0bXdWQl0hS1RAEBlKHwZAGycLAlxQVF0
fBhl6IiM3aQQPGEAQGU8NDlQHHkBmH1VfZUZQKh8JCgIPYBkVOEgFTlhnGAdHZxsJCwZ5XU9
bYR4BQjhIAVQOZxgHYBkIVV1GC2AZFmEeWFgQNRVSWGcYB2AZCjY2VBFgGVdLT2cbXjZUDAk

LDAQJCwlVWkYNYBlHQEEZFUYEH1keARhGYBlQADZUB2AZCw0MCwk4SFphHkhJWWAZAx82VFB
dS35cSFplRlANYR5MUw9gGQM4SEcMCwsMYR4XZUYJF0ljWFVZYBkDOEhFb2AZFmEeSF4XNRV
SWGcYB2AZCThIWmEeVkxOYBkDOEhHCAwNAwgMCwhUWkZhHhdmH09cSxQ1FVJYZxgHYBkJOEh
aYR5cSE1jWFYANlQHYBkLDQxnGxkXCx9BAAAAAOCZ9kY=",
"name": "10000. ENGINE",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"ASMzZDszKmw0Tk81L2p3aSIiNTozTzUvajMfRCRYQVt6bnENZ3hsPDVmMypsNwsnLnB8eHE
zKjVWDg8bRSgjNGw8NWMhIngrMmxKM3lzSWp8BjMlJi4jTDU5FGQpYnRLNCtrSzclJypVcWN
3TTItbhRkLXgiSzQrTDUkeXFqJ0w1Ok0ydHQ8GTl-
dEs0K0w1JhoaeD1MNXtnY0s3chp4ICUnICglJyV5dmohTDVrbG01OWooM3UyLTRqTDV8LBp4
K0w1JyEgJyUUZHZNMmRldUw1LzMaeHxxZ1JwZHZJanwhTTJgfyNMNS8UZGsgJycgTTI7SWol
O2VPdHl1TDUvFGRpQ0w1Ok0yZHI7GTl-
dEs0K0w1JRRkdk0yemBiTDUvFGRrJCAhLyQgJyR4dmpNMjtKM2NwZzgZOX50SzQrTDUlFGR2
TTJwZGFPdHosGngrTDUnISBLNzU7JzNtAAAAAP3T4hs="

   }

   ]

   }

   "children": [

   {

"token": "AfnpvuHp8LbulJXv9bCts_j47-
Dple_1sOnFnv6Cm4GgtKvXvaK25u-86fC27dH99Kqmoqvp8O-M1NXBn_L57rbm77n7-
KLx6LaQ6aOpk7Cm3On__PT5lu_jzr7zuK6R7vGxke3__fCPq7mtl-j3tM6-96L4ke7xlu_-
o6uw_Zbv4Jforq7mw-OkrpHu8Zbv_MDAoueW76G9uZHtqMCi-v_9-vL__f-jrLD7lu-
xtrfv47Dy6a_o9-6wlu-m9sCi8Zbv-_v9_P3OvqyX6L6_r5bv9enAoqarvYiqvqyTsKb7l-
i6pfmW7_XOvrH6_f36l-jhk7D_4b-VrqOvlu_1zr6zmZbv4Jfovqjhw-OkrpHu8Zbv-86-
rJfooLq4lu_1zr6x_vr79f76_f6irLCX6OGQ6bmqveLD46Suke7xlu_-
oMCi55bvq7m6kqz9-Nzp8JHu_Pr6k7Dh_bbosAAAAAA2o8lD",
"name": "70712. OUTER TRIM MOULDINGS",

   "links": [

   {

"action": "getUnits",
"label": "List units",
"token": "AUVVAl1VTApSKClTSQwRD0REU1xVKVNJDFV5IkI-
Jz0cCBdrAR4KWlMAVUwKUW1BSBYaHhdVTFMwaGl9I05FUgpaUwVHRB5NVAosVR8VLwwaYFVD
QEhFKlNfcgJPBBItUk0NLVFDQUwzFwURK1RLCHICSx5ELVJNKlNCHxcMQSpTXCtUEhJaf18Y
Ei1STSpTQHx8HlsqUx0BBS1RFHweRkNBRk5DQUMfEAxHKlMNCgtTXwxOVRNUS1IMKlMaSnwe
TSpTR0dBQEFyAhArVAIDEypTSVV8HhoXATQWAhAvDBpHK1QGGUUqU0lyAg1GQUFGK1RdLwxD
XQMpEh8TKlNJcgIPJSpTXCtUAhRdf18YEi1STSpTR3ICECtUHAYEKlNJcgINQkZHSUJGQUIe
EAwrVF0sVQUWAV5_XxgSLVJNKlNCHHweWypTFwUGLhBBRGBVTC1SQEZGLwxdQQpUDAAAAACU
1paC"

   }

   ]

   }

   {

"token": "AUJSBVpSSw1VLy5UTgsWCENDVFtSLlROC1J-
JUU5IDobDxBsBhkNXVQHUksNVmpGTxEdGRBSS1Q3b256JElCVQ1dVAJAQxlKUw0rUhgSKAsd
Z1JER09CLVRYdQVIAxUqVUoKKlZERks0EAIWLFNMD3UFTBlDKlVKLVRFGBALRi1UWyxTFRVd
eFgfFSpVSi1UR3t7GVwtVBoGAipWE3sZQURGQUlERkQYFwtALVQKDQxUWAtJUhRTTFULLVQd
TXsZSi1UQEBGR0F1BRcsUwUEFC1UTlJ7GR0QBjMRBRcoCx1ALFMBHkItVE51BQpBRkZBLFNa
KAtEWgQuFRgULVROdQUIIi1UWyxTBRNaeFgfFSpVSi1URHUFFyxTGwEDLVROdQUKRUFATkVB
RkUZFwssU1orUgIRBll4WB8VKlVKLVRFHHsZXC1UEAIBKRdGQ2dSSypVR0FBKAtaRg1TCwAA

AAAIvShX",
"name": "70715. TYPE PLATE",

   "links": [

   {

"action": "getUnits",
"label": "List units",
"token": "Aen5rvH54Kb-hIX_5aC9o-
jo__D5hf_loPnVju6Si5GwpLvHrbKm9v-s-eCm_cHt5Lq2srv54P-cxMXRj-
Lp_qb2_6nr6LLh-KaA-
bO5g6C2zPnv7OTphv_z3q7jqL6B_uGhgf3v7eCfu6m9h_jnpN6u57Logf7hhv_us7ug7Yb_8
If4vr720_O0voH-4Yb_7NDQsveG_7GtqYH9uNCy6u_t6uLv7e-zvKDrhv-hpqf_86Di-
b_45_6ghv-25tCy4Yb_6-vt7OrerryH-K6vv4b_5fnQsra7rZi6rryDoLbrh_iqtemG_-
XerqHq7e3qh_jxg6Dv8a-FvrO_hv_l3q6jiYb_8If4rrjx0_O0voH-
4Yb_796uvIf4sKqohv_l3q6h7urr5e7q7e6yvKCH-PGA-am6rfLT87S-
gf7hhv_ut9Cy94b_u6mqgrzt6Mz54IH-7Orqg6Dx7ab4oAAAAACRjfkD"

   }

   ]

   }

   {

"token": "Aa6-6ba-p-G5w8K4ouf65K-vuLe-
wrii576SyanVzNb34_yA6vXhsbjrvqfhuoaqo_3x9fy-p7jbg4KWyKWuueGxuO6sr_Wmv-
HHvvT-xOfxi76oq6Ouwbi0memk7_nGuabmxrqoqqfY_O76wL-
g45npoPWvxrmmwbip9PznqsG4t8C_-fmxlLTz-
ca5psG4q5eX9bDBuPbq7sa6_5f1raiqraWoqqj0--
eswbjm4eC4tOelvvi_oLnnwbjxoZf1psG4rKyqq6-Z6fvAv-no-
MG4or6X9fH86t_96fvE5_GswL_t8q7BuKKZ6eatqqqtwL-2xOeotujC-
fT4wbiimenkzsG4t8C_6f-2lLTz-ca5psG4qJnp-8C_9-3vwbiimenmqa2soqmtqqn1--
fAv7bHvu796rWUtPP5xrmmwbip8pf1sMG4_O7txfuqr4u-
p8a5q62txOe2quG_5wAAAAAjLqqG",
"name": "70717. AIR FILTERS AND LIDS",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"Ac_fiNffxoDYoqPZw4abhc7O2dbfo9nDht_zqMi0rbeWgp3hi5SA0NmK38aA2-
fLwpyQlJ3fxtm64uP3qcTP2IDQ2Y_NzpTH3oCm35WfpYaQ6t_JysLPoNnV-
IjFjpin2MeHp9vJy8a5nY-
bod7BgviIwZTOp9jHoNnIlZ2Gy6DZ1qHemJjQ9dWSmKfYx6DZyvb2lNGg2ZeLj6fbnvaUzMn
LzMTJy8mVmobNoNmHgIHZ1YbE35newdiGoNmQwPaUx6DZzc3Lys74iJqh3oiJmaDZw9_2lJC
di76ciJqlhpDNod6Mk8-g2cP4iIfMy8vMod7XpYbJ14mjmJWZoNnD-
IiFr6DZ1qHeiJ7X9dWSmKfYx6DZyfiImqHeloyOoNnD-IiHyMzNw8jMy8iUmoah3tem34-
ci9T11ZKYp9jHoNnIk_aU0aDZnY-MpJrLzurfxqfYyszMpYbXy4DehgAAAAAg3i5F"

   }

   ]

   }

   {

   "token"

"AV5OGUZOVxFJMzJIUhcKFF9fSEdOMkhSF05iOVklPCYHEwxwGgURQUgbTlcRSnZaUw0BBQx
OV0grc3JmOFVeSRFBSB5cXwVWTxE3TgQONBcBe05YW1NeMUhEaRlUHwk2SVYWNkpYWlcoDB4
KME9QE2kZUAVfNklWMUhZBAwXWjFIRzBPCQlBZEQDCTZJVjFIW2dnBUAxSAYaHjZKD2cFXVh
aXVVYWlgECxdcMUgWERBIRBdVTghPUEkXMUgBUWcFVjFIXFxaWFtpGQswTxkYCDFIUk5nBQE
MGi8NGQs0FwFcME8dAl4xSFJpGRZdWlpdME9GNBdYRhgyCQQIMUhSaRkUPjFIRzBPGQ9GZEQ
DCTZJVjFIWGkZCzBPBx0fMUhSaRkWWV1cUlldWlkFCxcwT0Y3Th4NGkVkRAMJNklWMUhaBmc
FQDFIDB4dNQtaX3tOVzZJW11dNBdGWhFPFwAAAADsrFC2",
"name": "70723. GUARDS",

   "links": [

   {

"action": "getUnits",
"label": "List units",
"token": "ASg4bzA4IWc_RUQ-
JGF8YikpPjE4RD4kYTgUTy9TSlBxZXoGbHNnNz5tOCFnPAAsJXt3c3o4IT5dBQQQTiMoP2c3
PmgqKXMgOWdBOHJ4QmF3DTguLSUoRz4yH28iaX9APyBgQDwuLCFeemh8RjkmZR9vJnMpQD8g
Rz4vcnphLEc-MUY5f383EjJ1f0A_IEc-
LRERczZHPnBsaEA8eRFzKy4sKyMuLC5yfWEqRz5gZ2Y-MmEjOH45Jj9hRz53JxFzIEc-
KiosLi0fb31GOW9ufkc-
JDgRc3d6bFl7b31CYXcqRjlrdChHPiQfb2ArLCwrRjkwQmEuMG5Ef3J-Rz4kH29iSEc-
MUY5b3kwEjJ1f0A_IEc-
Lh9vfUY5cWtpRz4kH29gLysqJC8rLC9zfWFGOTBBOGh7bDMSMnV_QD8gRz4scBFzNkc-
emhrQ30sKQ04IUA_LSsrQmEwLGc5YQAAAADUGVrg"

   }

   ]

   }

   {

   "token"

"ARcHUA8HHlgAensBG15DXRYWAQ4HewEbXgcrcBBsdW9OWkU5U0xYCAFSBx5YAz8TGkRITEU
HHgFiOjsvcRwXAFgIAVcVFkwfBlh-
B01HfV5IMgcREhoXeAENIFAdVkB_AB9ffwMREx5hRVdDeQYZWiBQGUwWfwAfeAEQTUVeE3gB
DnkGQEAILQ1KQH8AH3gBEi4uTAl4AU9TV38DRi5MFBETFBwRExFNQl4VeAFfWFkBDV4cB0EG
GQBeeAFIGC5MH3gBFRUTERcgUEJ5BlBRQXgBGwcuTEhFU2ZEUEJ9XkgVeQZUSxd4ARsgUF8U
ExMUeQYPfV4RD1F7QE1BeAEbIFBdd3gBDnkGUEYPLQ1KQH8AH3gBESBQQnkGTlRWeAEbIFBf
EBQVGxAUExBMQl55Bg9-
B1dEUwwtDUpAfwAfeAETSi5MCXgBRVdUfEITFjIHHn8AEhQUfV4PE1gGXgAAAAAeXJYH",
"name": "70726. FRONT BUMPER",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AQgYTxAYAUcfZWQeBEFcQgkJHhEYZB4EQRg0bw9zanBRRVomTFNHFx5NGAFHHCAMBVtXU1o
YAR59JSQwbgMIH0cXHkgKCVMAGUdhGFJYYkFXLRgODQUIZx4SP08CSV9gHwBAYBwODAF-
WkhcZhkGRT9PBlMJYB8AZx4PUlpBDGceEWYZX18XMhJVX2AfAGceDTExUxZnHlBMSGAcWTFT
Cw4MCwMODA5SXUEKZx5AR0YeEkEDGF4ZBh9BZx5XBzFTAGceCgoMDgg_T11mGU9OXmceBBgx
U1daTHlbT11iQVcKZhlLVAhnHgQ_T0ALDAwLZhkQYkEOEE5kX1JeZx4EP09CaGceEWYZT1kQ
MhJVX2AfAGceDj9PXWYZUUtJZx4EP09ADwsKBA8LDA9TXUFmGRBhGEhbTBMyElVfYB8AZx4M
VTFTFmceWkhLY10MCS0YAWAfDQsLYkEQDEcZQQAAAAC4OESD"

   }

   ]

   }

   {

   "token"

"AQMTRBsTCkwUbm8VD0pXSQICFRoTbxUPShM_ZAR4YXtaTlEtR1hMHBVGEwpMFysHDlBcWFE
TChV2Li87ZQgDFEwcFUMBAlgLEkxqE1lTaUpcJhMFBg4DbBUZNEQJQlRrFAtLaxcFBwp1UUN
XbRINTjREDVgCaxQLbBUEWVFKB2wVGm0SVFQcORleVGsUC2wVBjo6WB1sFVtHQ2sXUjpYAAU
HAAgFBwVZVkoBbBVLTE0VGUoIE1USDRRKbBVcDDpYC2wVAQEHBQI0RFZtEkRFVWwVDxM6WFx
RR3JQRFZpSlwBbRJAXwNsFQ80REsABwcAbRIbaUoFG0VvVFlVbBUPNERJY2wVGm0SRFIbORl
eVGsUC2wVBTREVm0SWkBCbBUPNERLBAABDwQABwRYVkptEhtqE0NQRxg5GV5UaxQLbBUHXzp
YHWwVUUNAaFYHAiYTCmsUBgAAaUobB0wSSgAAAACcg01S",
"name": "70727. REAR BUMPER",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AS09ajU9JGI6QEE7IWR5ZywsOzQ9QTshZD0RSipWT1V0YH8DaXZiMjtoPSRiOQUpIH5ydn8
9JDtYAAEVSyYtOmIyO20vLHYlPGJEPXd9R2RyCD0rKCAtQjs3GmonbHpFOiVlRTkrKSRbf21
5QzwjYBpqI3YsRTolQjsqd39kKUI7NEM8enoyFzdwekU6JUI7KBQUdjNCO3VpbUU5fBR2Lis
pLiYrKSt3eGQvQjtlYmM7N2QmPXs8IzpkQjtyIhR2JUI7Ly8pKywaanhDPGpre0I7IT0UdnJ
_aVx-
anhHZHIvQzxucS1COyEaamUuKSkuQzw1R2QrNWtBend7QjshGmpnTUI7NEM8anw1FzdwekU6
JUI7KxpqeEM8dG5sQjshGmplKi4vISouKSp2eGRDPDVEPW1-
aTYXN3B6RTolQjspcRR2M0I7f21uRngpLAg9JEU6KC4uR2Q1KWI8ZAAAAADqCFB4"

   }

   ]

   }

   {

   "token"

"AVZGEU5GXxlBOzpAWh8CHFdXQE9GOkBaH0ZqMVEtNC4PGwR4Eg0ZSUATRl8ZQn5SWwUJDQR
GX0Aje3puMF1WQRlJQBZUVw1eRxk_RgwGPB8Jc0ZQU1tWOUBMYRFcFwE-
QV4ePkJQUl8gBBYCOEdYG2ERWA1XPkFeOUBRDAQfUjlATzhHAQFJbEwLAT5BXjlAU29vDUg5
QA4SFj5CB28NVVBSVV1QUlAMAx9UOUAeGRhATB9dRgBHWEEfOUAJWW8NXjlAVFRSVlBhEQM4
RxEQADlAWkZvDQkEEicFEQM8HwlUOEcVClY5QFphER5VUlJVOEdOPB9QThA6AQwAOUBaYREc
NjlATzhHEQdObEwLAT5BXjlAUGERAzhHDxUXOUBaYREeUVVUWlFVUlENAx84R04_RhYFEk1s
TAsBPkFeOUBUDW8NSDlABBYVPQNSV3NGXz5BU1VVPB9OUhlHHwAAAACYg879",
"name": "70740. REARVIEW MIRRORS",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"ASIyZToyK201T040Lmt2aCMjNDsyTjQuazIeRSVZQFp7b3AMZnltPTRnMittNgomL3F9eXA
yKzRXDw4aRCkiNW09NGIgI3kqM21LMnhySGt9BzIkJy8iTTQ4FWUoY3VKNSpqSjYkJitUcGJ
2TDMsbxVlLHkjSjUqTTQleHBrJk00O0wzdXU9GDh_dUo1Kk00JxsbeTxNNHpmYko2cxt5ISQ
mISkkJiR4d2sgTTRqbWw0OGspMnQzLDVrTTR9LRt5Kk00ICAmIiQVZXdMM2VkdE00LjIbeX1
wZlNxZXdIa30gTDNhfiJNNC4VZWohJiYhTDM6SGskOmROdXh0TTQuFWVoQk00O0wzZXM6GDh
_dUo1Kk00JBVld0wze2FjTTQuFWVqJSEgLiUhJiV5d2tMMzpLMmJxZjkYOH91SjUqTTQgeRt
5PE00cGJhSXcmIwcyK0o1JyEhSGs6Jm0zawAAAADxotI_"

   }

   ]

   }

   {

   "token"

"AdzMm8TM1ZPLsbDK0JWIlt3dysXMsMrQlczgu9unvqSFkY7ymIeTw8qZzNWTyPTY0Y-
Dh47M1cqp8fDkutfcy5PDypze3YfUzZO1zIaMtpWD-
cza2dHcs8rG65vWnYu0y9SUtMja2NWqjpyIss3Skeub0ofdtMvUs8rbho6V2LPKxbLNi4vD5
saBi7TL1LPK2eXlh8KzyoSYnLTIjeWH39rY39fa2NqGiZXes8qUk5LKxpXXzIrN0suVs8qD0
WH1LPK3t7Y3Nnrm4myzZuairPK0Mzlh4OOmK2Pm4m2lYPess2fgNyzytDrm5Tf2Njfss3Etp
XaxJqwi4aKs8rQ65uWvLPKxbLNm43E5saBi7TL1LPK2uubibLNhZ-
ds8rQ65uU29_e0Nvf2NuHiZWyzcS1zJyPmMfmxoGLtMvUs8rehOWHwrPKjpyft4nY3fnM1bT
L2d_ftpXE2JPNlQAAAACqUrAH",
"name": "70743. BOARD DOCUMENTATION",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AdzMm8TM1ZPLsbDK0JWIlt3dysXMsMrQlczgu9unvqSFkY7ymIeTw8qZzNWTyPTY0Y-
Dh47M1cqp8fDkutfcy5PDypze3YfUzZO1zIaMtpWD-
cza2dHcs8rG65vWnYu0y9SUtMja2NWqjpyIss3Skeub0ofdtMvUs8rbho6V2LPKxbLNi4vD5
saBi7TL1LPK2eXlh8KzyoSYnLTIjeWH39rY39fa2NqGiZXes8qUk5LKxpXXzIrN0suVs8qD0
WH1LPK3t7Y3Nnrm4myzZuairPK0Mzlh4OOmK2Pm4m2lYPess2fgNyzytDrm5Tf2Njfss3Etp
XaxJqwi4aKs8rQ65uWvLPKxbLNm43E5saBi7TL1LPK2uubibLNhZ-
ds8rQ65uU29_e0Nvf2NuHiZWyzcS1zJyPmMfmxoGLtMvUs8rehOWHwrPKjpyft4nY3fnM1bT
L2d_ftpXE2JPNlQAAAACqUrAH"

   }

   ]

   }

   {

"token": "AcLShdrSy43Vr67UzouWiMPD1NvSrtTOi9L-
pcW5oLqbj5DshpmN3dSH0suN1urGz5GdmZDSy9S37-
76pMnC1Y3d1ILAw5nK042r0piSqIud59LEx8_CrdTY9YXIg5Wq1cqKqtbExsu0kIKWrNPMj_
WFzJnDqtXKrdTFmJCLxq3U26zTlZXd-
NiflarVyq3Ux_v7mdyt1JqGgqrWk_uZwcTGwcnExsSYl4vArdSKjYzU2IvJ0pTTzNWLrdSdz
fuZyq3UwMDGw8T1hZes04WElK3UztL7mZ2QhrORhZeoi53ArNOBnsKt1M71hYrBxsbBrNPaq
IvE2oSulZiUrdTO9YWIoq3U26zThZPa-
NiflarVyq3UxPWFl6zTm4GDrdTO9YWKxcHAzsXBxsWZl4us09qr0oKRhtn42J-
VqtXKrdTBmfuZ3K3UkIKBqZfGw-fSy6rVx8HBqIvaxo3TiwAAAABEDk6B",
"name": "70750. PRESCRIPTION AND INFORMATION NAME PLATE",

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AUpaDVJaQwVdJyZcRgMeAEtLXFNaJlxGA1p2LU0xKDITBxhkDhEFVVwPWkMFXmJORxkVERh
aQ1w_Z2ZyLEFKXQVVXApISxFCWwUjWhAaIAMVb1pMT0dKJVxQfQ1ACx0iXUICIl5MTkM8GAo
eJFtEB30NRBFLIl1CJVxNEBgDTiVcUyRbHR1VcFAXHSJdQiVcT3NzEVQlXBIOCiJeG3MRSUx
OSUFMTkwQHwNIJVwCBQRcUANBWhxbRF0DJVwVRXMRQiVcSEhOS0x9DR8kWw0MHCVcRlpzERU
YDjsZDR8gAxVIJFsJFkolXEZ9DQJJTk5JJFtSIANMUgwmHRAcJVxGfQ0AKiVcUyRbDRtScFA
XHSJdQiVcTH0NHyRbEwkLJVxGfQ0CTUlIRk1JTk0RHwMkW1IjWgoZDlFwUBcdIl1CJVxJEXM
RVCVcGAoJIR9OS29aQyJdT0lJIANSTgVbAwAAAAC9dviM"

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getUnits
This function allows to get a list of a certain vehicle units within the navigation or after executing the operation, for example, filtration.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"UnitsListResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/UnitShortListV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, UnitShortListV2Dto
Example of the previous step
"action": "getUnits",
"label": "List units",
"token": "AbOj9Kujuvyk3t-lv_rn-bKypaqj36W_-uSp8s_lwtK2t9CB9-
j8rKX2o7r8p5u3vuDs6OGjuqXGnp-L1bizpPyspfOxsui7ovzao-
nj2frslqO1tr6z3KWphPS58uTbpLv726e1t7rF4fPn3aK9_oT0qeD02OXu5Nun4orostLbpK
3cpea3uqX08tuku9ylsejklqOs26Tk7uDstrOV7-
_bpLvcpbTs7vywt7fao6zbp7W5pPXo26S73KW06orordyl_-
Th9dn67Jajsre2uNylqYT0qenh9PXo89jrt4rou9yl3MfBtLTq5vqxsLeytLG1s-
qK6K3cpfDk6O7mtLOV7-
_bpLvcpbXv5_i5tbK_3aKr2fq7vPLcpbzdoraw6Of_tLC3t7Gwt9n6-paj6ePao7rbp-
mK6K3cpeLz6fHghPTw3aLU2qOs26e8t7Pe7-HZ7O_p8bCK6LvcpbS43KX4pavoraLp7-
Wivaejiujo5Nuku9yltOjmlqOs26Ty8-PZ-uyx3aLq5_HE5vG5iui7-
9uk4uHz2ru5rt2ivdqjs9XZ-vqWo-Po6u719dn67JajtLe03aKr2fqzpObp6ePe7ujZ-
uyWo7GzvrexsLWE9Obdourp7_Tv2frslqOxtdqjrNunobOr89ylvN2itbXo75ajrNuk4ujm9
qu_ud7u6NqjutungpCLsrG1trGwt7Xs4_uztrXao6zbp66zoujj6-Pe7ujZ-
uyWo7Cwt7O4srDhiuit3KXr9_Pbp-
KK6LC1t7e0tbe16eb6sdylqt2i7uGE9PDdorbao6zbp7yko_fl26S73KXWhPTm3aLj5_jf6O
OHu6Xv9O_ao7rbp-rvlqOs26Tm8vfau7mu3aK92qOxt7WE9Lf8_aX7AAAAAHRnuoQ="
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getUnits>: {
"token": "AbOj9Kujuvyk3t-lv_rn-bKypaqj36W_-uSp8s_lwtK2t9CB9-

j8rKX2o7r8p5u3vuDs6OGjuqXGnp-L1bizpPyspfOxsui7ovzao-
nj2frslqO1tr6z3KWphPS58uTbpLv726e1t7rF4fPn3aK9_oT0qeD02OXu5Nun4orostLbpK
3cpea3uqX08tuku9ylsejklqOs26Tk7uDstrOV7-
_bpLvcpbTs7vywt7fao6zbp7W5pPXo26S73KW06orordyl_-
Th9dn67Jajsre2uNylqYT0qenh9PXo89jrt4rou9yl3MfBtLTq5vqxsLeytLG1s-
qK6K3cpfDk6O7mtLOV7-
_bpLvcpbXv5_i5tbK_3aKr2fq7vPLcpbzdoraw6Of_tLC3t7Gwt9n6-paj6ePao7rbp-
mK6K3cpeLz6fHghPTw3aLU2qOs26e8t7Pe7-HZ7O_p8bCK6LvcpbS43KX4pavoraLp7-
Wivaejiujo5Nuku9yltOjmlqOs26Ty8-PZ-uyx3aLq5_HE5vG5iui7-
9uk4uHz2ru5rt2ivdqjs9XZ-vqWo-Po6u719dn67JajtLe03aKr2fqzpObp6ePe7ujZ-
uyWo7GzvrexsLWE9Obdourp7_Tv2frslqOxtdqjrNunobOr89ylvN2itbXo75ajrNuk4ujm9
qu_ud7u6NqjutungpCLsrG1trGwt7Xs4_uztrXao6zbp66zoujj6-Pe7ujZ-
uyWo7Cwt7O4srDhiuit3KXr9_Pbp-
KK6LC1t7e0tbe16eb6sdylqt2i7uGE9PDdorbao6zbp7yko_fl26S73KXWhPTm3aLj5_jf6O
OHu6Xv9O_ao7rbp-rvlqOs26Tm8vfau7mu3aK92qOxt7WE9Lf8_aX7AAAAAHRnuoQ=",
"currentFilterState": ""

   }

Response example

   {

"dataType": "UnitsListResponseV2",

   "data": {

   "units": [

   {

   "code": "10000/00"

"name": "ENGINE (Var.: 1/Rev.: 0)",

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",

   "token"

"AX1tOmVtdDJqEBFrcTQpN3x8a2RtEWtxNCpnPAErDBx4eR5POSYyYms4bXQyaVV5cC4iJi9
tdGsIUFFFG3Z9ajJiaz1_fCZ1bDIUbSctFzQiWG17eHB9EmtnSjp3PCoVanU1FWl7eXQLLz0
pE2xzMEo6Zy46FisgKhVpLEQmfBwVamMSayh5dGs6PBVqdRJrfyYqWG1iFWoqIC4ieH1bISE
VanUSa3oiIDJ-
eXkUbWIVaXt3ajsmFWp1Emt6JEQmYxJrMSovOxc0IlhtfHl4dhJrZ0o6ZycvOjsmPRYleUQm
dRJrEgkPenokKDR_fnl8en97fSREJmMSaz4qJiAoen1bISEVanUSa3shKTZ3e3xxE2xlFzR1
cjwSa3ITbHh-Jikxen55eX9-eRc0NFhtJy0UbXQVaSdEJmMSayw9Jz8uSjo-
E2waFG1iFWlyeX0QIS8XIiEnP35EJnUSa3p2Ems2a2UmY2wnIStsc2ltRCYmKhVqdRJreiYo
WG1iFWo8PS0XNCJ_E2wkKT8KKD93RCZ1NRVqLC89FHV3YBNscxRtfRsXNDRYbS0mJCA7Oxc0
Ilhtenl6E2xlFzR9aignJy0QICYXNCJYbX99cHl_fntKOigTbCQnITohFzQiWG1_exRtYhVp
b31lPRJrchNse3smIVhtYhVqLCYoOGVxdxAgJhRtdBVpTF5FfH97eH9-
eXsiLTV9eHsUbWIVaWB9bCYtJS0QICYXNCJYbX5-
eX12fH4vRCZjEmslOT0VaSxEJn57eXl6e3l7Jyg0fxJrZBNsIC9KOj4TbHgUbWIVaXJqbTkr
FWp1EmsYSjooE2wtKTYRJi1JdWshOiEUbXQVaSQhWG1iFWooPDkUdXdgE2xzFG1_eXtKOnky
M2tkbTsgLzQiJjQSayErEmtxSjowfX59fRNsZRc0a3crEmtyNBJrJndoQC46KBRtdDIXNGtj
PT4WKyAqFWksRCZ_EmtkE2wwLndqWG10FWp9fnlySjooE2w_KT0nKCVifVhtdBVqfhJrZ0o6
ciomICsjKxYleUQmdRJreHh_e3MjLT0TbGUUbTwsPX9rbSAgLBRtdBVpJkQmYxJrOyg9Fih5
fFhtdBVqfxJrZ0o6cC4sJS0MIS0uSjo-E2x4eH9-eWQmKFhtYhVqIjg6FzQiWG1_fHh-
e3x7Jik0f34VamMSay93YVsgKBYlICA9I0o6PhNse3ETbGUXNHtlOxEqJysSa3FKOjcdEmtk
E2wqJHp3cT0Sa3ITbH17JEQmYxJrKyMnKiNzRCZ1Emt4E2xlFzR9aignJy0QICYXNCJYbX99
cHl_fntKOigTbCQnITohFzQiWG1_exRtYhVpdXBlPD0gOxAgJhc0IlhtFA8JfH97eyYoNH96
fHl9eHsXNDRYbTsnITsHLRc0Ilhtent4e3sVaTpEJiYqFWp1Emt6SjooE2wtOiY4LBc0Ilht
HRVqYxJrLGRoWywhLRRtdBVpJyg0E2w0NTJsNAAAAADQeIfa"

   }

   {

"action": "getUnitParts",
"label": "Parts",
"token": "AZSE04yEnduD-fiCmN3A3pWVgo2E-
IKY3cOO1ejC5fWRkPem0M_bi4LRhJ3bgLyQmcfLz8aEnYLhubis8p-Ug9uLgtSWlc-
chdv9hM7E_t3LsYSSkZmU-4KOo9Oe1cP8g5zc_ICSkJ3ixtTA-
oWa2aPTjsfT_8LJw_yAxa3PlfX8g4r7gsGQnYLT1fyDnPuCls_DsYSL_IPDycfLkZSyyMj8g
5z7gpPLyduXkJD9hIv8gJKeg9LP_IOc-
4KTza3PivuC2MPG0v7dy7GElZCRn_uCjqPTjs7G09LP1P_MkK3PnPuC--
Dmk5PNwd2Wl5CVk5aSlM2tz4r7gtfDz8nBk5SyyMj8g5z7gpLIwN-ekpWY-
oWM_t2cm9X7gpv6hZGXz8DYk5eQkJaXkP7d3bGEzsT9hJ38gM6tz4r7gsXUztbHo9PX-
oXz_YSL_ICbkJT5yMb-y8jO1petz5z7gpOf-
4LfgozPioXOyMKFmoCErc_Pw_yDnPuCk8_BsYSL_IPV1MT-3cuW-oXNwNbjwdaerc-
c3PyDxcbU_ZyeifqFmv2ElPL-3d2xhMTPzcnS0v7dy7GEk5CT-oWM_t2Ug8HOzsT5yc_-
3cuxhJaUmZCWl5Kj08H6hc3OyNPI_t3LsYSWkv2Ei_yAhpSM1PuCm_qFkpLPyLGEi_yDxc_B
0YyYnvnJz_2EnfyApbeslZaSkZaXkJLLxNyUkZL9hIv8gImUhc_EzMT5yc_-
3cuxhJeXkJSflZfGrc-K-
4LM0NT8gMWtz5eSkJCTkpCSzsHdlvuCjfqFycaj09f6hZH9hIv8gJuDhNDC_IOc-4Lxo9PB-
oXEwN_4z8SgnILI08j9hJ38gM3IsYSL_IPB1dD9nJ6J-
oWa_YSWkJKj05Db2oKNhNLJxt3Lz937gsjC-4KYo9PZlJeUlPqFjP7dgp7C-
4Kb3fuCz56BqcfTwf2Endv-3YKK1Nf_wsnD_IDFrc-W-4KN-oXZx56DsYSd_IOUl5Cbo9PB-
oXWwNTOwcyLlLGEnfyDl_uCjqPTm8PPycLKwv_MkK3PnPuCkZGWkprKxNT6hYz9hNXF1JaCh
MnJxf2EnfyAz63PivuC0sHU_8GQlbGEnfyDlvuCjqPTmcfFzMTlyMTHo9PX-
oWRkZaXkI3PwbGEi_yDy9HT_t3LsYSWlZGXkpWSz8Ddlpf8g4r7gsaeiLLJwf_MycnUyqPT1
_qFkpj6hYz-3ZKM0vjDzsL7gpij0970-4KN-
oXDzZOemNT7gpv6hZSSza3PivuCwsrOw8qarc-c-4KR-oWM_t2Ug8HOzsT5yc_-
3cuxhJaUmZCWl5Kj08H6hc3OyNPI_t3LsYSWkv2Ei_yAnJmM1dTJ0vnJz_7dy7GE_ebglZaS
ks_B3ZaTlZCUkZL-3d2xhNLOyNLuxP7dy7GEk5KRkpL8gNOtz8_D_IOc-4KTo9PB-
oXE08_Rxf7dy7GE9PyDivuCxY2BssXIxP2EnfyAzsHd-oXd3NuF3QAAAAAysKZt"

   }

   ]

   "token"

"AeLypfry6631j4707qu2qOPj9PvyjvTuq7X4o560k4Pn5oHQprmt_fSn8uut9srm77G9ubD
y6_SXz87ahOni9a399KLg47nq862L8riyiKu9x_Lk5-
_ijfT41aXoo7WK9eqqivbk5uuUsKK2jPPsr9Wl-
LGlibS_tYr2s9u544OK9fyN9Lfm6_Slo4r16o304Lm1x_L9ivW1v7G95-
LEvr6K9eqN9OW9v63h5uaL8v2K9uTo9aS5ivXqjfTlu9u5_I30rrWwpIirvcfy4-bn6Y30-
NWl-LiwpaS5oom65tu56o30jZaQ5eW7t6vg4ebj5eDk4rvbufyN9KG1ub-
35eLEvr6K9eqN9OS-tqno5OPujPP6iKvq7aON9O2M8-
fhubau5eHm5uDh5oirq8fyuLKL8uuK9rjbufyN9LOiuKCx1aWhjPOFi_L9ivbt5uKPvrCIvb
64oOHbueqN9OXpjfSp9Pq5_PO4vrTz7Pby27m5tYr16o305bm3x_L9ivWjorKIq73gjPO7tq
CVt6Do27nqqor1s7Cii-ro_4zz7Ivy4oSIq6vH8rK5u7-
kpIirvcfy5ebljPP6iKvi9be4uLKPv7mIq73H8uDi7-bg4eTVpbeM87u4vqW-
iKu9x_Lg5Ivy_Yr28OL6oo307Yzz5OS5vsfy_Yr1s7m3p_ru6I-_uYvy64r208Ha4-Dk5-
Dh5uS9sqri5-SL8v2K9v_i87myurKPv7mIq73H8uHh5uLp4-
Gw27n8jfS6pqKK9rPbueHk5ubl5ObkuLer4I30-4zzv7DVpaGM8-
eL8v2K9u318qa0ivXqjfSH1aW3jPOytqmOubLW6vS-pb6L8uuK9ru-
x_L9ivW3o6aL6uj_jPPsi_Lg5uTVpeatrPT78qS_sKu9uauN9L60jfTu1aWv4uHi4ozz-
oir9Oi0jfTtq430uej337Glt4vy662Iq_T8oqGJtL-
1ivaz27ngjfT7jPOvsej1x_LrivXi4ebt1aW3jPOgtqK4t7r94sfy64r14Y30-
NWl7bW5v7S8tIm65tu56o305-fg5Oy8sqKM8_qL8qOzouD08r-
_s4vy64r2udu5_I30pLeiibfm48fy64r14I30-NWl77GzurKTvrKx1aWhjPPn5-
Dh5vu5t8fy_Yr1vaeliKu9x_Lg4-fh5OPkubar4OGK9fyN9LDo_sS_t4m6v7-
ivNWloYzz5O6M8_qIq-T6pI61uLSN9O7VpaiCjfT7jPO1u-Xo7qKN9O2M8-
Lku9u5_I30tLy4tbzs27nqjfTnjPP6iKvi9be4uLKPv7mIq73H8uDi7-
bg4eTVpbeM87u4vqW-iKu9x_Lg5Ivy_Yr26u_6o6K_pI-_uYirvcfyi5CW4-Dk5Lm3q-Dl4-
bi5-

SIq6vH8qS4vqSYsoirvcfy5eTn5OSK9qXbubm1ivXqjfTl1aW3jPOypbmns4irvcfygor1_I
30s_v3xLO-sovy64r2uLerjPOrqq3zqwAAAABVm69F",
"imageNames": [
    "https://img.altechopersys.com/CFIAT84/%size%/97/97976a4374afad6a477684c9ecf5dc66.gif?s=1332&k=e483c5961fcc18700e8e7773ed50d448"

   ]

   }

   {

   "code": "10002/00"

"name": "POWER PLANT SUSPENSIONS (Var.: 1/Rev.: 0)",

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",
"token": "AfvrvOPr8rTslpft97Kvsfr67eLrl-33sqzhuoetipr-
_5jJv6C05O2-6_K079P_9qikoKnr8u2O1tfDnfD77LTk7bv5-
qDz6rSS66GrkbKk3uv9_vb7lO3hzLzxuqyT7POzk-
_9__KNqbuvler1tsy84ai8kK2mrJPvqsKg-pqT7OWU7a7_8u28upPs85Tt-aCs3uvkk-
yspqik_vvdp6eT7POU7fykprT4__-S6-ST7_3x7L2gk-zzlO38osKg5ZTtt6ypvZGypN7r-
v_-8JTt4cy84aGpvL2gu5Cj_8Kg85TtlI-J_PyirrL5-P_6_Pn9-
6LCoOWU7bisoKau_Pvdp6eT7POU7f2nr7Dx_fr3lerjkbLz9LqU7fSV6v74oK-
3_Pj___n4_5Gyst7roauS6_KT76HCoOWU7aq7obmozLy4leqckuvkk-
_0__uWp6mRpKehufjCoPOU7fzwlO2w7eOg5eqhp63q9e_rwqCgrJPs85Tt_KCu3uvkk-
y6u6uRsqT5leqir7mMrrnxwqDzs5Psqqm7kvPx5pXq9ZLr-
52RsrLe66ugoqa9vZGypN7r_P_8lerjkbL77K6hoauWpqCRsqTe6_n79v_5-
P3MvK6V6qKhp7ynkbKk3uv5_ZLr5JPv6fvju5Tt9JXq_f2gp97r5JPsqqCuvuP38ZamoJLr8
pPvytjD-vn9_vn4__2kq7P7_v2S6-ST7-b76qCro6uWpqCRsqTe6_j4__vw-
vipwqDllO2jv7uT76rCoPj9___8_f_9oa6y-ZTt4pXqpqnMvLiV6v6S6-ST7_Ts67-tk-
zzlO2ezLyuleqrr7CXoKvP8-2nvKeS6_KT76Kn3uvkk-yuur-S8_Hmler1kuv5__3MvP-
0te3i672mqbKkoLKU7aetlO33zLy2-_j7-
JXq45Gy7fGtlO30spTtoPHuxqi8rpLr8rSRsu3lu7iQraask--
qwqD7lO3ileq2qPHs3uvyk-z7-P_0zLyuleq5r7uhrqPk-97r8pPs-
JTt4cy89Kygpq2lrZCj_8Kg85Tt_v75_fWlq7uV6uOS67qqu_nt66amqpLr8pPvoMKg5ZTtv
a67kK7_-t7r8pPs-ZTt4cy89qiqo6uKp6uozLy4ler-_vn4_eKgrt7r5JPspL68kbKk3uv5-
v74_fr9oK-y-
fiT7OWU7anx592mrpCjpqa7pcy8uJXq_feV6uORsv3jvZesoa2U7ffMvLGblO3ileqsovzx9
7uU7fSV6vv9osKg5ZTtraWhrKX1wqDzlO3-lerjkbL77K6hoauWpqCRsqTe6_n79v_5-
P3MvK6V6qKhp7ynkbKk3uv5_ZLr5JPv8_bjurumvZamoJGypN7rkomP-vn9_aCusvn8-
v_7_v2RsrLe672hp72Bq5GypN7r_P3-_f6T77zCoKCsk-zzlO38zLyuleqrvKC-
qpGypN7rm5Ps5ZTtquLu3aqnq5Lr8pPvoa6yleqys7TqsgAAAABjXExS"

   }

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"AVpKHUJKUxVNNzZMVhMOEFtbTENKNkxWEw1AGyYMKztfXjloHgEVRUwfSlMVTnJeVwkFAQh
KU0wvd3ZiPFFaTRVFTBpYWwFSSxUzSgAKMBMFf0pcX1daNUxAbR1QGw0yTVISMk5cXlMsCBo
ONEtUF20dQAkdMQwHDTJOC2MBWzsyTUQ1TA9eU0wdGzJNUjVMWAENf0pFMk0NBwkFX1p8BgY
yTVI1TF0FBxVZXl4zSkUyTlxQTRwBMk1SNUxdA2MBRDVMFg0IHDATBX9KW15fUTVMQG0dQAA
IHRwBGjECXmMBUjVMNS4oXV0DDxNYWV5bXVhcWgNjAUQ1TBkNAQcPXVp8BgYyTVI1TFwGDhF
QXFtWNEtCMBNSVRs1TFU0S19ZAQ4WXVleXlhZXjATE39KAAozSlMyTgBjAUQ1TAsaABgJbR0
ZNEs9M0pFMk5VXlo3BggwBQYAGFljAVI1TF1RNUwRTEIBREsABgxLVE5KYwEBDTJNUjVMXQE
Pf0pFMk0bGgowEwVYNEsDDhgtDxhQYwFSEjJNCwgaM1JQRzRLVDNKWjwwExN_SgoBAwccHDA
TBX9KXV5dNEtCMBNaTQ8AAAo3BwEwEwV_SlhaV15YWVxtHQ80SwMABh0GMBMFf0pYXDNKRTJ
OSFpCGjVMVTRLXFwBBn9KRTJNCwEPH0JWUDcHATNKUzJOa3liW1hcX1hZXlwFChJaX1wzSkU
yTkdaSwEKAgo3BwEwEwV_SllZXlpRW1kIYwFENUwCHhoyTgtjAVlcXl5dXF5cAA8TWDVMQzR

LBwhtHRk0S18zSkUyTlVNSh4MMk1SNUw_bR0PNEsKDhE2AQpuUkwGHQYzSlMyTgMGf0pFMk0
PGx4zUlBHNEtUM0pYXlxtHV4VFExDShwHCBMFARM1TAYMNUxWbR0XWllaWTRLQjATTFAMNUx
VEzVMAVBPZwkdDzNKUxUwE0xEGhkxDAcNMk4LYwFaNUxDNEsXCVBNf0pTMk1aWV5VbR0PNEs
YDhoADwJFWn9KUzJNWTVMQG0dVQ0BBwwEDDECXmMBUjVMX19YXFQECho0S0IzShsLGlhMSgc
HCzNKUzJOAWMBRDVMHA8aMQ9eW39KUzJNWDVMQG0dVwkLAgorBgoJbR0ZNEtfX1hZXEMBD39
KRTJNBR8dMBMFf0pYW19ZXFtcAQ4TWFkyTUQ1TAhQRnwHDzECBwcaBG0dGTRLXFY0S0IwE1x
CHDYNAAw1TFZtHRA6NUxDNEsNA11QVho1TFU0S1pcA2MBRDVMDAQADQRUYwFSNUxfNEtCMBN
aTQ8AAAo3BwEwEwV_SlhaV15YWVxtHQ80SwMABh0GMBMFf0pYXDNKRTJOUldCGxoHHDcHATA
TBX9KMyguW1hcXAEPE1hdW15aX1wwExN_ShwABhwgCjATBX9KXVxfXF8yTh1jAQENMk1SNUx
dbR0PNEsKHQEfCzATBX9KOjJNRDVMC0NPfAsGCjNKUzJOAA8TNEsTEhVLEwAAAAD5tNO-"

   }

   ]

"token": "AUxcC1RcRQNbISBaQAUYBk1NWlVcIFpABRtWDTAaPS1JSC9-
CBcDU1oJXEUDWGRIQR8TFx5cRVo5YWB0KkdMWwNTWgxOTRdEXQMlXBYcJgUTaVxKSUFMI1pW
ewtGDRskW0QEJFhKSEU6HgwYIl1CAXsLVh8LJxoRGyRYHXUXTS0kW1IjWhlIRVoLDSRbRCNa
ThcbaVxTJFsbER8TSUxqEBAkW0QjWksTEQNPSEglXFMkWEpGWwoXJFtEI1pLFXUXUiNaABse
CiYFE2lcTUhJRyNaVnsLVhYeCwoXDCcUSHUXRCNaIzg-
S0sVGQVOT0hNS05KTBV1F1IjWg8bFxEZS0xqEBAkW0QjWkoQGAdGSk1AIl1UJgVEQw0jWkMi
XUlPFxgAS09ISE5PSCYFBWlcFhwlXEUkWBZ1F1IjWh0MFg4fewsPIl0rJVxTJFhDSEwhEB4m
ExAWDk91F0QjWktHI1oHWlQXUl0WEBpdQlhcdRcXGyRbRCNaSxcZaVxTJFsNDBwmBRNOIl0V
GA47GQ5GdRdEBCRbHR4MJURGUSJdQiVcTComBQVpXBwXFREKCiYFE2lcS0hLIl1UJgVMWxkW
FhwhERcmBRNpXE5MQUhOT0p7CxkiXRUWEAsQJgUTaVxOSiVcUyRYXkxUDCNaQyJdSkoXEGlc
UyRbHRcZCVRARiERFyVcRSRYfW90TU5KSU5PSEoTHARMSUolXFMkWFFMXRccFBwhERcmBRNp
XE9PSExHTU8edRdSI1oUCAwkWB11F09KSEhLSkhKFhkFTiNaVSJdER57Cw8iXUklXFMkWENb
XAgaJFtEI1opewsZIl0cGAcgFxx4RFoQCxAlXEUkWBUQaVxTJFsZDQglREZRIl1CJVxOSEp7
C0gDAlpVXAoRHgUTFwUjWhAaI1pAewsBTE9MTyJdVCYFWkYaI1pDBSNaF0ZZcR8LGSVcRQMm
BVpSDA8nGhEbJFgddRdMI1pVIl0BH0ZbaVxFJFtMT0hDewsZIl0OGAwWGRRTTGlcRSRbTyNa
VnsLQxsXERoSGicUSHUXRCNaSUlOSkISHAwiXVQlXA0dDE5aXBERHSVcRSRYF3UXUiNaChkM
JxlITWlcRSRbTiNaVnsLQR8dFBw9EBwfewsPIl1JSU5PSlUXGWlcUyRbEwkLJgUTaVxOTUlP
Sk1KFxgFTk8kW1IjWh5GUGoRGScUEREMEnsLDyJdSkAiXVQmBUpUCiAbFhojWkB7CwYsI1pV
Il0bFUtGQAwjWkMiXUxKFXUXUiNaGhIWGxJCdRdEI1pJIl1UJgVMWxkWFhwhERcmBRNpXE5M
QUhOT0p7CxkiXRUWEAsQJgUTaVxOSiVcUyRYREFUDQwRCiERFyYFE2lcJT44TU5KShcZBU5L
TUhMSUomBQVpXAoWEAo2HCYFE2lcS0pJSkkkWAt1FxcbJFtEI1pLewsZIl0cCxcJHSYFE2lc
LCRbUiNaHVVZah0QHCVcRSRYFhkFIl0FBANdBQAAAABZP_20",
"imageNames": [
"https://img.altechopersys.com/CFIAT84/%size%/c0

## /c0fda35003b4d0085585e0868ed1879b.gif?

s=1332&k=7db9c97993acf039941356c2e5486a0d"

   ]

   }

   {

   "code": "10002/00"

"name": "POWER PLANT SUSPENSIONS (Var.: 2/Rev.: 0)",

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",

   "token"

"AaW14r21rOqyyMmzqezx76Sks7y1ybOp7PK_5Nnz1MSgocaX4f7qurPgtazqsY2hqPb6_ve
1rLPQiImdw66lsuq6s-WnpP6ttOrMtf_1z-z6gLWjoKilyrO_kuKv5PLNsq3tzbGjoazT9-
Xxy7Sr6JLiv_bizvP48s2x9Jz-pMTNsrvKs_ChrLPi5M2yrcqzp_7ygLW6zbLy-Pb6oKWD-
fnNsq3Ks6L6-OqmoaHMtbrNsaOvsuP-zbKtyrOi_Jz-u8qz6fL348_s-
oC1pKGgrsqzv5Liv__34uP-5c79oZz-rcqzytHXoqL88OynpqGkoqejpfyc_rvKs-
by_vjwoqWD-fnNsq3Ks6P58e6vo6Spy7S9z-
ytquTKs6rLtKCm_vHpoqahoaemoc_s7IC1__XMtazNsf-c_rvKs_Tl_-
f2kuLmy7TCzLW6zbGqoaXI-ffP-vn_56ac_q3Ks6KuyrPus73-u7T_-fO0q7G1nP7-
8s2yrcqzov7wgLW6zbLk5fXP7Pqny7T88efS8OevnP6t7c2y9PflzK2vuMu0q8y1pcPP7OyA

tfX-_Pjj48_s-oC1oqGiy7S9z-ylsvD___XI-P7P7PqAtaelqKGnpqOS4vDLtPz_-eL5z-
z6gLWno8y1us2xt6W95cqzqsu0o6P--
YC1us2y9P7w4L2pr8j4_sy1rM2xlIadpKejoKemoaP69e2loKPMtbrNsbiltP71_fXI-
P7P7PqAtaamoaWupKb3nP67yrP94eXNsfSc_qajoaGio6Gj__Dsp8qzvMu0-
PeS4ubLtKDMtbrNsaqyteHzzbKtyrPAkuLwy7T18e7J_vWRrbP54vnMtazNsfz5gLW6zbLw5
OHMra-4y7SrzLWnoaOS4qHq67O8teP49-
z6_uzKs_nzyrOpkuLopaalp8u0vc_ss6_zyrOq7Mqz_q-
wmPbi8My1rOrP7LO75ebO8_jyzbH0nP6lyrO8y7To9q-
ygLWszbKlpqGqkuLwy7Tn8eX_8P26pYC1rM2ypcqzv5LiqvL--PP78879oZz-
rcqzoKCno6v79eXLtL3MteT05aeztfj49My1rM2x_pz-
u8qz4_DlzvChpIC1rM2yp8qzv5LiqPb0_fXU-fX2kuLmy7SgoKemo7z-8IC1us2y-uDiz-
z6gLWnpKCmo6Sj_vHsp6bNsrvKs_evuYP48M79-Pjl-
5Li5su0o6nLtL3P7KO948ny__PKs6mS4u_FyrO8y7Ty_KKvqeXKs6rLtKWj_Jz-
u8qz8_v_8vurnP6tyrOgy7S9z-ylsvD___XI-P7P7PqAtaelqKGnpqOS4vDLtPz_-eL5z-
z6gLWno8y1us2xrai95OX448j4_s_s-oC1zNfRpKejo_7w7KeipKGloKPP7OyAteP_-
ePf9c_s-oC1oqOgo6HNseKc_v7yzbKtyrOikuLwy7T14v7g9M_s-
oC1xc2yu8qz9Lywg_T59cy1rM2x__Dsy7Ts7eq07AAAAACh-5Zs"

   }

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"ARICVQoCG10Ff34EHltGWBMTBAsCfgQeW0UIU25EY3MXFnEgVkldDQRXAhtdBjoWH0FNSUA
CGwRnPz4qdBkSBV0NBFIQE0kaA117AkhCeFtNNwIUFx8SfQQIJVUYU0V6BRpaegYUFhtkQFJ
GfAMcXyVVCEFVeURPRXoGQytJE3N6BQx9BEcWGwRVU3oFGn0EEElFNwINegVFT0FNFxI0Tk5
6BRp9BBVNT10RFhZ7Ag16BhQYBVRJegUafQQVSytJDH0EXkVAVHhbTTcCExYXGX0ECCVVCEh
AVVRJUnlKFitJGn0EfWZgFRVLR1sQERYTFRAUEksrSQx9BFFFSU9HFRI0Tk56BRp9BBRORlk
YFBMefAMKeFsaHVN9BB18AxcRSUZeFREWFhARFnhbWzcCSEJ7Aht6BkgrSQx9BENSSFBBJVV
RfAN1ewINegYdFhJ_TkB4TU5IUBErSRp9BBUZfQRZBApJDANITkQDHAYCK0lJRXoFGn0EFUl
HNwINegVTUkJ4W00QfANLRlBlR1AYK0kaWnoFQ0BSexoYD3wDHHsCEnR4W1s3AkJJS09UVHh
bTTcCFRYVfAMKeFsSBUdISEJ_T0l4W003AhASHxYQERQlVUd8A0tITlVOeFtNNwIQFHsCDXo
GABIKUn0EHXwDFBRJTjcCDXoFQ0lHVwoeGH9PSXsCG3oGIzEqExAUFxARFhRNQloSFxR7Ag1
6Bg8SA0lCSkJ_T0l4W003AhERFhIZExFAK0kMfQRKVlJ6BkMrSREUFhYVFBYUSEdbEH0EC3w
DT0AlVVF8Axd7Ag16Bh0FAlZEegUafQR3JVVHfANCRll-
SUImGgROVU57Aht6BktONwINegVHU1Z7GhgPfAMcewIQFhQlVRZdXAQLAlRPQFtNSVt9BE5E
fQQeJVVfEhESEHwDCnhbBBhEfQQdW30ESRgHL0FVR3sCG114WwQMUlF5RE9FegZDK0kSfQQL
fANfQRgFNwIbegUSERYdJVVHfANQRlJIR0oNEjcCG3oFEn0ECCVVHUVJT0RMRHlKFitJGn0E
FxcQFBxMQlJ8Awp7AlNDUhAEAk9PQ3sCG3oGSStJDH0EVEdSeUcWEzcCG3oFEH0ECCVVH0FD
SkJjTkJBJVVRfAMXFxARFAtJRzcCDXoFTVdVeFtNNwIQExcRFBMUSUZbEBF6BQx9BEAYDjRP
R3lKT09STCVVUXwDFB58Awp4WxQKVH5FSER9BB4lVVhyfQQLfANFSxUYHlJ9BB18AxIUSytJ
DH0ERExIRUwcK0kafQQXfAMKeFsSBUdISEJ_T0l4W003AhASHxYQERQlVUd8A0tITlVOeFtN
NwIQFHsCDXoGGh8KU1JPVH9PSXhbTTcCe2BmExAUFElHWxAVExYSFxR4W1s3AlRITlRoQnhb
TTcCFRQXFBZ6BlUrSUlFegUafQQVJVVHfANCVUlXQ3hbTTcCcnoFDH0EQwsHNENOQnsCG3oG
SEdbfANbWl0DWwAAAACbmCeK"

   }

   ]

"token": "Ae7-qfb-56H5g4L44qe6pO_v-Pf-
gvjip7n0r5K4n4_r6o3cqrWh8fir_ueh-sbq472xtbz-5_ibw8LWiOXu-aHx-
K7s77Xm_6GH_rS-hKexy_7o6-Pugfj02ankr7mG-
eamhvro6ueYvK66gP_go9mp9L2phbizuYb6v9e174-G-fCB-
Lvq5_ipr4b55oH47LW5y_7xhvm5s72x6-7IsrKG-eaB-Omxs6Ht6uqH_vGG-ujk-
ai1hvnmgfjpt9e18IH4orm8qISnscv-7-
rr5YH49Nmp9LS8qai1roW26te15oH4gZqc6em3u6fs7erv6ezo7rfXtfCB-
K25tbO76e7IsrKG-eaB-OiyuqXk6O_igP_2hKfm4a-B-OGA_-vttbqi6e3q6uzt6oSnp8v-
tL6H_ueG-rTXtfCB-L-utKy92amtgP-Jh_7xhvrh6u6DsryEsbK0rO3XteaB-Onlgfil-
Pa18P-0srj_4Pr-17W1uYb55oH46bW7y_7xhvmvrr6Ep7HsgP-
3uqyZu6zk17Xmpob5v7yuh-bk84D_4If-7oiEp6fL_r61t7OoqISnscv-6erpgP_2hKfu-

bu0tL6Ds7WEp7HL_uzu4-rs7ejZqbuA_7e0sqmyhKexy_7s6If-
8Yb6_O72roH44YD_6Oi1ssv-8Yb5v7W7q_bi5IOztYf-54b6383W7-zo6-zt6uixvqbu6-
iH_vGG-vPu_7W-tr6Ds7WEp7HL_u3t6u7l7-2817Xwgfi2qq6G-
r_Xte3o6urp6OrotLun7IH494D_s7zZqa2A_-uH_vGG-uH5_qq4hvnmgfiL2am7gP--
uqWCtb7a5viyqbKH_ueG-
reyy_7xhvm7r6qH5uTzgP_gh_7s6ujZqeqhoPj3_qizvKextaeB-
LK4gfji2amj7u3u7ID_9oSn-OS4gfjhp4H4teT7072pu4f-
56GEp_jwrq2FuLO5hvq_17Xugfj3gP-jveT5y_7nhvnu7erh2am7gP-suq60u7bx7sv-
54b57oH49Nmp4bm1s7iwuIW26te15oH46-vs6OCwvq6A__aH_q-_ruz4_rOzv4f-
54b6tde18IH4qLuuhbvq78v-54b57IH49Nmp472_tr6fsr692amtgP_r6-zt6Pe1u8v-
8Yb5sauphKexy_7s7-vt6O_otbqn7O2G-fCB-Lzk8sizu4W2s7OusNmprYD_6OKA__aEp-
j2qIK5tLiB-OLZqaSOgfj3gP-5t-nk4q6B-OGA_-
7ot9e18IH4uLC0ubDg17XmgfjrgP_2hKfu-bu0tL6Ds7WEp7HL_uzu4-
rs7ejZqbuA_7e0sqmyhKexy_7s6If-8Yb65uP2r66zqIOztYSnscv-h5ya7-zo6LW7p-zp7-
ru6-iEp6fL_qi0sqiUvoSnscv-6ejr6OqG-qnXtbW5hvnmgfjp2am7gP--qbWrv4Snscv-
job58IH4v_f7yL-yvof-54b6tLungP-npqH_pwAAAADCUTlq",
"imageNames": [
"https://img.altechopersys.com/CFIAT84/%size%/42

## /4231e9e9e2560afacf2ba8209c6ad8d4.gif?

s=1332&k=e5ec68dbd430dfc544ea04d711a23960"

   ]

   }

   {

   "code": "10003/00"

"name": "ENGINE SUSPENSIONS (Var.: 1/Rev.: 0)",

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",

   "token"

"ASU1Yj01LGoySEkzKWxxbyQkMzw1STMpbHI_ZFlzVEQgIUYXYX5qOjNgNSxqMQ0hKHZ6fnc
1LDNQCAkdQy4lMmo6M2UnJH4tNGpMNX91T2x6ADUjICglSjM_EmIvZHJNMi1tTTEjISxTd2V
xSzQraBJiP3ZiTnN4ck0xdBx-
JERNMjtKM3AhLDNiZE0yLUozJ35yADU6TTJyeHZ6ICUDeXlNMi1KMyJ6eGomISFMNTpNMSMv
MmN-TTItSjMifBx-O0ozaXJ3Y09segA1JCEgLkozPxJiP393YmN-ZU59IRx-
LUozSlFXIiJ8cGwnJiEkIicjJXwcfjtKM2ZyfnhwIiUDeXlNMi1KMyN5cW4vIyQpSzQ9T2wt
KmRKMypLNCAmfnFpIiYhIScmIU9sbAA1f3VMNSxNMX8cfjtKM3Rlf2d2EmJmSzRCTDU6TTEq
ISVIeXdPenl_ZyYcfi1KMyIuSjNuMz1-OzR_eXM0KzE1HH5-
ck0yLUozIn5wADU6TTJkZXVPbHonSzR8cWdScGcvHH4tbU0ydHdlTC0vOEs0K0w1JUNPbGwA

## NXV-

fHhjY09segA1IiEiSzQ9T2wlMnB_f3VIeH5PbHoANSclKCEnJiMSYnBLNHx_eWJ5T2x6ADUn
I0w1Ok0xNyU9ZUozKks0IyN-
eQA1Ok0ydH5wYD0pL0h4fkw1LE0xFAYdJCcjICcmISN6dW0lICNMNTpNMTglNH51fXVIeH5P
bHoANSYmISUuJCZ3HH47SjN9YWVNMXQcfiYjISEiIyEjf3BsJ0ozPEs0eHcSYmZLNCBMNTpN
MSoyNWFzTTItSjNAEmJwSzR1cW5JfnURLTN5YnlMNSxNMXx5ADU6TTJwZGFMLS84SzQrTDUn
ISMSYiFqazM8NWN4d2x6fmxKM3lzSjMpEmJoJSYlKEs0PU9sMy9zSjMqbEozfi8wGHZicEw1
LGpPbDM7ZWZOc3hyTTF0HH4kSjM8SzRodi8yADUsTTIlJiEqEmJwSzRncWV_cH06JQA1LE0y
JkozPxJiKnJ-eHN7c059IRx-LUozICAnIyt7dWVLND1MNWR0ZSczNXh4dEw1LE0xfhx-
O0ozY3BlTnAhJAA1LE0yJ0ozPxJiKHZ0fXVUeXV2EmJmSzQgICcmIjx-
cAA1Ok0yemBiT2x6ADUnJCAmIyQjfnFsJyZNMjtKM3cvOQN4cE59eHhlexJiZks0IylLND1P
bCM9Y0lyf3NKMykSYm9FSjM8SzRyfCIvKWVKMypLNCUjfBx-
O0ozc3t_cnsrHH4tSjMgSzQ9T2wlMnB_f3VIeH5PbHoANSclKCEnJiMSYnBLNHx_eWJ5T2x6
ADUnI0w1Ok0xLSg9ZGV4Y0h4fk9segA1TFdRJCcjI35wbCciJCElICNPbGwANWN_eWNfdU9s
egA1IiMgIy5NMWIcfn5yTTItSjMiEmJwSzR1Yn5gdE9segA1RU0yO0ozdDwwA3R5dUw1LE0x
f3BsSzRsbWo0bAAAAADcWidN"

   }

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"AZuL3IOLktSM9veNl9LP0ZqajYKL942X0syB2ufN6vqen_ip38DUhI3ei5LUj7OflsjEwMm
Lko3utrej_ZCbjNSEjduZmsCTitTyi8HL8dLEvoudnpab9I2BrNyR2szzjJPT84-
dn5LtydvP9YqV1qzcgcjc8M3GzPOPyqLAmvrzjIX0jc6fko3c2vOMk_SNmcDMvouE84zMxsj
Enpu9x8fzjJP0jZzExtSYn5_yi4Tzj52RjN3A84yT9I2cwqLAhfSN18zJ3fHSxL6Lmp-
ekPSNgazcgcHJ3N3A2_DDn6LAk_SN9O_pnJzCztKZmJ-
anJmdm8KiwIX0jdjMwMbOnJu9x8fzjJP0jZ3Hz9CRnZqX9YqD8dKTlNr0jZT1ip6YwM_XnJi
fn5mYn_HS0r6Lwcvyi5Lzj8GiwIX0jcrbwdnIrNzY9Yr88ouE84-
Un5v2x8nxxMfB2ZiiwJP0jZyQ9I3QjYPAhYrBx82KlY-
LosDAzPOMk_SNnMDOvouE84za28vx0sSZ9YrCz9nsztmRosCT0_OMysnb8pORhvWKlfKLm_3
x0tK-i8vAwsbd3fHSxL6LnJ-c9YqD8dKbjM7Bwcv2xsDx0sS-i5mblp-
ZmJ2s3M71isLBx9zH8dLEvouZnfKLhPOPiZuD2_SNlPWKnZ3Ax76LhPOMysDO3oOXkfbGwPK
LkvOPqrijmpmdnpmYn53Ey9Obnp3yi4Tzj4abisDLw8v2xsDx0sS-
i5iYn5uQmpjJosCF9I3D39vzj8qiwJidn5-cnZ-
dwc7SmfSNgvWKxsms3Nj1ip7yi4Tzj5SMi9_N84yT9I3-
rNzO9YrLz9D3wMuvk43H3Mfyi5Lzj8LHvouE84zO2t_yk5GG9YqV8ouZn52s3J_U1Y2Ci93G
ydLEwNL0jcfN9I2XrNzWm5iblvWKg_HSjZHN9I2U0vSNwJGOpsjczvKLktTx0o2F29jwzcbM
84_KosCa9I2C9YrWyJGMvouS84ybmJ-
UrNzO9YrZz9vBzsOEm76LkvOMmPSNgazclMzAxs3FzfDDn6LAk_SNnp6ZnZXFy9v1ioPyi9r
K25mNi8bGyvKLkvOPwKLAhfSN3c7b8M6fmr6LkvOMmfSNgazclsjKw8vqx8vIrNzY9Yqenpm
YnILAzr6LhPOMxN7c8dLEvouZmp6YnZqdwM_SmZjzjIX0jcmRh73GzvDDxsbbxazc2PWKnZf
1ioPx0p2D3ffMwc30jZes3NH79I2C9YrMwpyRl9v0jZT1ipudwqLAhfSNzcXBzMWVosCT9I2
e9YqD8dKbjM7Bwcv2xsDx0sS-i5mblp-
ZmJ2s3M71isLBx9zH8dLEvouZnfKLhPOPk5aD2tvG3fbGwPHSxL6L8unvmpmdncDO0pmcmp-
bnp3x0tK-i93Bx93hy_HSxL6LnJ2enZDzj9yiwMDM84yT9I2crNzO9YrL3MDeyvHSxL6L-
_OMhfSNyoKOvcrHy_KLkvOPwc7S9YrS09SK0gAAAACkj-A4"

   }

   ]

   "token"

"Aa296rW9pOK6wMG7oeT556ysu7S9wbuh5Pq37NH73Myoqc6f6fbisrvovaTiuYWpoP7y9v-
9pLvYgIGVy6atuuKyu-2vrPalvOLEvff9x-TyiL2rqKCtwru3muqn7PrFuqXlxbmrqaTb_-
35w7yj4Jrqt_7qxvvw-
sW5_JT2rMzFurPCu_ippLvq7MW6pcK7r_b6iL2yxbr68P7yqK2L8fHFuqXCu6ry8OKuqanEv
bLFuaunuuv2xbqlwruq9JT2s8K74fr_68fk8oi9rKmopsK7t5rqt_f_6uv27cb1qZT2pcK7w
tnfqqr0-OSvrqmsqq-rrfSU9rPCu-769vD4qq2L8fHFuqXCu6vx-eanq6yhw7y1x-
SlouzCu6LDvKiu9vnhqq6pqa-uqcfk5Ii99_3EvaTFufeU9rPCu_zt9-_-
muruw7zKxL2yxbmiqa3A8f_H8vH3766U9qXCu6qmwrvmu7X2s7z38fu8o7m9lPb2-
sW6pcK7qvb4iL2yxbrs7f3H5PKvw7z0-e_a-O-
nlPal5cW6_P_txKWnsMO8o8S9rcvH5OSIvf329PDr68fk8oi9qqmqw7y1x-
Stuvj39_3A8PbH5PKIva-toKmvrqua6vjDvPT38erxx-
TyiL2vq8S9ssW5v6217cK7osO8q6v28Yi9ssW6_Pb46LWhp8Dw9sS9pMW5nI6VrK-rqK-
uqavy_eWtqKvEvbLFubCtvPb99f3A8PbH5PKIva6uqa2mrK7_lPazwrv16e3FufyU9q6rqam
qq6mr9_jkr8K7tMO88P-a6u7DvKjEvbLFuaK6ven7xbqlwrvImur4w7z9-
ebB9v2Zpbvx6vHEvaTFufTxiL2yxbr47OnEpaeww7yjxL2vqaua6qni47u0vevw_-
Ty9uTCu_H7wruhmurgra6toMO8tcfku6f7wrui5MK79qe4kP7q-MS9pOLH5Luz7e7G-
_D6xbn8lPaswru0w7zg_qe6iL2kxbqtrqmimur4w7zv-e33-
PWyrYi9pMW6rsK7t5rqovr28Pvz-8b1qZT2pcK7qKivq6Pz_e3DvLXEvez87a-
7vfDw_MS9pMW59pT2s8K76_jtxviprIi9pMW6r8K7t5rqoP789f3c8f3-muruw7yoqK-
uqrT2-Ii9ssW68ujqx-TyiL2vrKiuq6yr9vnkr67FurPCu_-nsYvw-
Mb18PDt85rq7sO8q6HDvLXH5Ku168H69_vCu6Ga6ufNwru0w7z69Kqnoe3Cu6LDvK2r9JT2s
8K7-_P3-vOjlPalwruow7y1x-Stuvj39_3A8PbH5PKIva-toKmvrqua6vjDvPT38erxx-
TyiL2vq8S9ssW5paC17O3w68Dw9sfk8oi9xN_ZrK-rq_b45K-
qrKmtqKvH5OSIvev38evX_cfk8oi9qquoq6bFueqU9vb6xbqlwruqmur4w7z96vbo_Mfk8oi
9zcW6s8K7_LS4i_zx_cS9pMW59_jkw7zk5eK85AAAAADwS9ET",
"imageNames": [

   "
<https://img.altechopersys.com/CFIAT84/%size%/71>

## /71260891c68e2fb0d316dc12bed3f8d5.gif?

s=1332&k=0975aa970bc4e194fdc2d8f51cfb48bf"

   ]

   }

   ]

   }

   }

POST /restApi/v2/getFilter
This function allows to get a list of conditions that are necessary to specify other parameters of request, for example when some detail
matches different vehicles.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"FilterFormResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/FormV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, FormV2Dto

Example of the previous step
"action": "getFilter",
"label": "Select filter options",

   "token"

"AZqK3YKKk9WN9_aMltPO0JubjIOK9oyW07KHkdHNw5_IxsWW3sHVhYzfipPVjrKel8nFwci
Kk4zuvKjRmJiXnpiL04DTiYrMi5SN0_WMxZWjwZL1jJ2Yn5eax83WnJzyjYT1jN-Cm7-
Kk9XzisTP3LWel8n1jJXT9YzalJeKy8XL84qT8o6Ko7_0i8PGzPXy8NPF1pqbnp6E9fLw04u
A9PXyjZL18vDTpbScmPLz9IuC8K2jwd7AwPP09YyWraO_ivGa9_L-
mp3Ay9PkkZ2enZ6c8K2jwdX1jNLV1IyA05GKzIuUjdP1jMWVo8GS9Yycm5CYm8GjwYT1jNzb
zfKOy4S_isTP3-
zI2s2t3dnT9YzMyd3Ly56NmvSLlPOK0vLwrd2Ewc3y8_SLlPCto8GYmPLz9IuC8K2jwdvOx8
v09fKOy6O_9Iufn_T18o6Mo8GE9Yzay9_yjsujwdP18vOK3_Lwrd3Z09TT84qF8o6HmovBys
LK9IuU8NOEv_T1jMLBzfLwrd3ZnZucn5mF8vCt3ZfL9fLzipPy8K3duf-
dn_P09YyAraO_it_HwfT18o7Lo7_0i_ab8PP5mMDO15jllpyZnJmeraO_itTyjdXU047d3Zb
BzYyVitLyjpibv4qT8o2ZmJqexMjXm5yc84qF8o6CjIf0i5TU9IvDzYG7gtzI8o2S0vKOhJy
V9IuU84rS8vCt3ZX09fKNktLT0a3dz_SL28HB3fKOy6PB0_Xy84rczcito7-
Kk_Lz9Iuena7O05CZ8vP0i9Pw09O_isrP283Owd6Io8GS9YzU9PXyjpaWh_T18o2S9fLw08_
S9PXyjYT18vDTjITBzfLz9IuU8K2jwZmZ8vP0i9Pw09O_it_Lx8HKwsmt3dn0i9Xz9PWMwZi
bv_T1jJWdm5ycwNO_9PWM28v18vDTxb_09Yz1_52f8K2jwYT18vOK38fCraO_ipPy8_SL9pi
ppbScmJ-bmOWWn8DK1Jr18vOK1PKOjIKeioWMycHNjJbThL-
KwMrzipPyjsLN1ZqY8JubmJ6drd3P9Ivd3Mz1jJaKo8HFyN7ryd3P8NPFmPSL28ze9YyWrd2
Y9PXyjd718vDTxZjV1PKNhPWM2Z-
Wl_SLlPOK0vLwrd2Wy83y8_SLlPCto8GYmPGemJGe8K2jwdX1jIP0i83NhZqEx9vX84qT8o6
Ko7_0i8nGzPXy8NPFv_T1jJ-
Z9fLw09O_9PWM3M_AyvCto8GS9fLzipie8K2jwdX1jIP0i9jJmZaAxMzyjZL1jNeto7-
KxMfL9PXyjsvK0ZqZn4P09fKOhZy_9PWMlfT18o6rqNeZ9fLzioXy8K3dlcHH8vP0i5TwraP
B8J329f-dn53Fz6-Qmp-an5vy8K3dnvSL09KE9YzYrd3Z9IvbwcHd8o6M3c-
Kz8Lb6crajsvdhM3d-8HB3d2O3d2FxN3h34qTjOu0q7bm4Pr89_-cjowAAAAALJKQ_w=="
Request example
POST: /restApi/v2/getFilter: {
"formValues": [],

   "token"

"AZqK3YKKk9WN9_aMltPO0JubjIOK9oyW07KHkdHNw5_IxsWW3sHVhYzfipPVjrKel8nFwci
Kk4zuvKjRmJiXnpiL04DTiYrMi5SN0_WMxZWjwZL1jJ2Yn5eax83WnJzyjYT1jN-Cm7-
Kk9XzisTP3LWel8n1jJXT9YzalJeKy8XL84qT8o6Ko7_0i8PGzPXy8NPF1pqbnp6E9fLw04u
A9PXyjZL18vDTpbScmPLz9IuC8K2jwd7AwPP09YyWraO_ivGa9_L-
mp3Ay9PkkZ2enZ6c8K2jwdX1jNLV1IyA05GKzIuUjdP1jMWVo8GS9Yycm5CYm8GjwYT1jNzb
zfKOy4S_isTP3-
zI2s2t3dnT9YzMyd3Ly56NmvSLlPOK0vLwrd2Ewc3y8_SLlPCto8GYmPLz9IuC8K2jwdvOx8
v09fKOy6O_9Iufn_T18o6Mo8GE9Yzay9_yjsujwdP18vOK3_Lwrd3Z09TT84qF8o6HmovBys
LK9IuU8NOEv_T1jMLBzfLwrd3ZnZucn5mF8vCt3ZfL9fLzipPy8K3duf-
dn_P09YyAraO_it_HwfT18o7Lo7_0i_ab8PP5mMDO15jllpyZnJmeraO_itTyjdXU047d3Zb
BzYyVitLyjpibv4qT8o2ZmJqexMjXm5yc84qF8o6CjIf0i5TU9IvDzYG7gtzI8o2S0vKOhJy
V9IuU84rS8vCt3ZX09fKNktLT0a3dz_SL28HB3fKOy6PB0_Xy84rczcito7-
Kk_Lz9Iuena7O05CZ8vP0i9Pw09O_isrP283Owd6Io8GS9YzU9PXyjpaWh_T18o2S9fLw08_
S9PXyjYT18vDTjITBzfLz9IuU8K2jwZmZ8vP0i9Pw09O_it_Lx8HKwsmt3dn0i9Xz9PWMwZi
bv_T1jJWdm5ycwNO_9PWM28v18vDTxb_09Yz1_52f8K2jwYT18vOK38fCraO_ipPy8_SL9pi
ppbScmJ-bmOWWn8DK1Jr18vOK1PKOjIKeioWMycHNjJbThL-
KwMrzipPyjsLN1ZqY8JubmJ6drd3P9Ivd3Mz1jJaKo8HFyN7ryd3P8NPFmPSL28ze9YyWrd2
Y9PXyjd718vDTxZjV1PKNhPWM2Z-
Wl_SLlPOK0vLwrd2Wy83y8_SLlPCto8GYmPGemJGe8K2jwdX1jIP0i83NhZqEx9vX84qT8o6
Ko7_0i8nGzPXy8NPFv_T1jJ-

Z9fLw09O_9PWM3M_AyvCto8GS9fLzipie8K2jwdX1jIP0i9jJmZaAxMzyjZL1jNeto7-
KxMfL9PXyjsvK0ZqZn4P09fKOhZy_9PWMlfT18o6rqNeZ9fLzioXy8K3dlcHH8vP0i5TwraP
B8J329f-dn53Fz6-Qmp-an5vy8K3dnvSL09KE9YzYrd3Z9IvbwcHd8o6M3c-
Kz8Lb6crajsvdhM3d-8HB3d2O3d2FxN3h34qTjOu0q7bm4Pr89_-cjowAAAAALJKQ_w==",
"currentFilterState": ""

   }

Response example

   {

"dataType": "FilterFormResponseV2",

   "data": {

"action": "getUnits",
"label": "Select filter options",
"operationName": "GETUNITS_V2",
"token": "Aa6-6ba-p-G5w8K4ouf65K-vuLe-
wrii54azpeX596v88vGi6vXhsbjrvqfhuoaqo_3x9fy-
p7jaiJzlrKyjqqy_57Tnvb74v6C558G48aGX9abBuKmsq6Ou8_niqKjGubDBuOu2r4u-p-
HHvvD76IGqo_3BuKHnwbjuoKO-__H_x76nxrq-l4vAv_fy-MHGxOfx4q6vqqqwwcbE57-
0wMHGuabBxsTnkYCorMbHwL-2xJmX9er09MfAwbiimZeLvsWuw8bKrqn0_-
fQpamqqaqoxJmX9eHBuObh4Li056W--L-guefBuPGhl_Wmwbior6Ssr_WX9bDBuOjv-
ca6_7CLvvD769j87vmZ6e3nwbj4_en__6q5rsC_oMe-
5sbEmemw9fnGx8C_oMSZl_WsrMbHwL-2xJmX9e_68__Awca6_5eLwL-
rq8DBxrq4l_Wwwbju_-vGuv-X9efBxse-68bEment5-Dnx76xxrqzrr_1_vb-wL-
gxOewi8DBuPb1-cbEmentqa-
oq62xxsSZ6aP_wcbHvqfGxJnpjcupq8fAwbi0mZeLvuvz9cDBxrr_l4vAv8KvxMfNrPT646z
RoqitqK2qmZeLvuDGueHg57rp6aL1-
bihvubGuqyvi76nxrmtrK6q8Pzjr6iox76xxrq2uLPAv6DgwL_3-
bWPtuj8xrmm5sa6sKihwL-gx77mxsSZ6aHAwca5pubn5Znp-8C_7_X16ca6_5f158HGx77o-
fyZl4u-p8bHwL-qqZr656StxsfAv-fE5-
eLvv777_n69eq8l_WmwbjgwMHGuqKis8DBxrmmwcbE5_vmwMHGubDBxsTnuLD1-cbHwL-
gxJmX9a2txsfAv-fE5-eLvuv_8_X-9v2Z6e3Av-
HHwMG49ayvi8DBuKGpr6io9OeLwMG47__BxsTn8YvAwbjBy6mrxJmX9bDBxse-
6_P2mZeLvqfGx8C_wqydkYCorKuvrNGiq_T-4K7Bxse-4Ma6uLaqvrG4_fDp2_ux6e2--
v_vyfPz7Lbp-77-6OLs6biinumk7_nX9Pi_trq2uLPR8v65weAAAAAAcyDAMQ==",

   "fields": [

   {

   "type": "select"

"name": "ssdMod",
"label": "Radio BMW Professional (S663A)",

   "options": [

   {

   "value"

"AaPq4vDa59LC1un78I2un8nWpdPD0dbUiYeT5vf54NCts7cAAAAAONDDQg==",
"label": "Yes"

   }

   {

"value": "AYvCytjyz_ro8euG5Kaskev96N3s-f78oa-
z6_PJ7ImFm58AAAAA7gOXsQ==",
"label": "No"

   }

   ]

   }

   {

   "type": "select"

"name": "ssdMod",

"label": "TV function (S601A)",

   "options": [

   {

   "value"

"AVMaEgAqFyBRElQvHU0BHFgWXwtUISYkeXdgFgQ2MApdQ0cAAAAAd3UYAQ==",
"label": "Yes"

   }

   {

"value": "Aeqjq7mTrpvuiIjng8_b0qKUi7zomJ-dwM7VgriJtJHk-
v4AAAAAH82Vbg==",
"label": "No"

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getUnitInfo
That is a function for getting information about a certain unit, about its image map and properties.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"UnitInfoResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/UnitV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, UnitV2Dto
Example of the previous step
"action": "getUnitInfo",
"label": "Unit info",
"token": "Aben8K-
nvvig2tuhu_7j_ba2oa6n26G7_uCt9svhxtays9SF8-z4qKHyp774o5-
zuuTo7OWnvqHCmpuP0by3oPioofe1tuy_pvjep-
3n3f7okqexsrq32KGtgPC99uDfoL__36Oxs77B5ffj2aa5-oDwreTw3OHq4N-
j5o7sttbfoKnYoeKzvqHw9t-gv9ihtezgkqeo36Dg6uTosreR6-
vfoL_YobDo6vi0s7Pep6jfo7G9oPHs36C_2KGw7o7sqdih--Dl8d3-
6JKntrOyvNihrYDwre3l8PHs99zvs47sv9ih2MPFsLDu4v61tLO2sLWxt-
6O7KnYofTg7OrisLeR6-
vfoL_YobHr4_y9sba72aav3f6_uPbYobjZprK07OP7sLSzs7W0s93-_pKn7efep77fo-
2O7KnYoeb37fXkgPD02abQ3qeo36O4s7fa6-Xd6Ovt9bSO7L_YobC82KH8oa_sqabt6-
GmuaOnjuzs4N-gv9ihsOzikqeo36D29-fd_ui12abu4_XA4vW9juy__9-g5uX33r-
9qtmmud6nt9Hd_v6Sp-fs7urx8d3-
6JKnsLOw2aav3f63oOLt7efa6uzd_uiSp7W3urO1tLGA8OLZpu7t6_Dr3f7okqe1sd6nqN-
jpbev99ihuNmmsbHs65KnqN-g5uzi8q-7vdrq7N6nvt-jhpSPtrWxsrW0s7Ho5_-
3srHep6jfo6q3puzn7-fa6uzd_uiSp7S0s7e8trTljuyp2KHv8_ffo-
aO7LSxs7OwsbOx7eL-
tdihrtmm6uWA8PTZprLep6jfo7igp_Ph36C_2KHSgPDi2abn4_zb7OeDv6Hr8Ovep77fo-
7rkqeo36Di9vPev72q2aa53qe1s7GA8LP4-
aGup_Hq5f7o7P7Yoevh2KG7gPD6t7S3t9mmr93-
ob3h2KG4_tih7L2iiuTw4t6nvvjd_qGp9_Tc4erg36Pmjuy12KGu2ab65L2gkqe-
36C3tLO4gPDi2ab14_ft4u-ot5Knvt-
gtNihrYDwuODs6uHp4dzvs47sv9ihsrK1sbnp5_fZpq_ep_bm97Whp-rq5t6nvt-
j7I7sqdih8eL33OKztpKnvt-gtdihrYDwuuTm7-fG6-fkgPD02aaysrW0s67s4pKnqN-
g6PLw3f7okqe1trK0sbax7OP-
tbTfoKnYoeW9q5Hq4tzv6ur36YDw9NmmsbvZpq_d_rGv8dvg7eHYobuA8P3X2KGu2abg7rC9
u_fYobjZprex7o7sqdih4ent4Om5juy_2KGy2aav3f63oOLt7efa6uzd_uiSp7W3urO1tLGA
8OLZpu7t6_Dr3f7okqe1sd6nqN-jv7qv9vfq8drq7N3-
6JKn3sXDtrWxsezi_rWwtrO3srHd_v6Sp_Ht6_HN593-
6JKnsLGysbHfo_CO7Ozg36C_2KGwgPDi2abn8Ozy5t3-6JKn19-gqdih5q6ikebr596nvt-
j7eL-2ab-__im_gAAAADddagR"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getUnitInfo>: {
"token": "Aben8K-nvvig2tuhu_7j_ba2oa6n26G7_uCt9svhxtays9SF8-
z4qKHyp774o5-zuuTo7OWnvqHCmpuP0by3oPioofe1tuy_pvjep-
3n3f7okqexsrq32KGtgPC99uDfoL__36Oxs77B5ffj2aa5-oDwreTw3OHq4N-
j5o7sttbfoKnYoeKzvqHw9t-gv9ihtezgkqeo36Dg6uTosreR6-
vfoL_YobDo6vi0s7Pep6jfo7G9oPHs36C_2KGw7o7sqdih--Dl8d3-
6JKntrOyvNihrYDwre3l8PHs99zvs47sv9ih2MPFsLDu4v61tLO2sLWxt-
6O7KnYofTg7OrisLeR6-
vfoL_YobHr4_y9sba72aav3f6_uPbYobjZprK07OP7sLSzs7W0s93-_pKn7efep77fo-
2O7KnYoeb37fXkgPD02abQ3qeo36O4s7fa6-Xd6Ovt9bSO7L_YobC82KH8oa_sqabt6-

GmuaOnjuzs4N-gv9ihsOzikqeo36D29-fd_ui12abu4_XA4vW9juy__9-g5uX33r-
9qtmmud6nt9Hd_v6Sp-fs7urx8d3-
6JKnsLOw2aav3f63oOLt7efa6uzd_uiSp7W3urO1tLGA8OLZpu7t6_Dr3f7okqe1sd6nqN-
jpbev99ihuNmmsbHs65KnqN-g5uzi8q-7vdrq7N6nvt-jhpSPtrWxsrW0s7Ho5_-
3srHep6jfo6q3puzn7-fa6uzd_uiSp7S0s7e8trTljuyp2KHv8_ffo-
aO7LSxs7OwsbOx7eL-
tdihrtmm6uWA8PTZprLep6jfo7igp_Ph36C_2KHSgPDi2abn4_zb7OeDv6Hr8Ovep77fo-
7rkqeo36Di9vPev72q2aa53qe1s7GA8LP4-
aGup_Hq5f7o7P7Yoevh2KG7gPD6t7S3t9mmr93-
ob3h2KG4_tih7L2iiuTw4t6nvvjd_qGp9_Tc4erg36Pmjuy12KGu2ab65L2gkqe-
36C3tLO4gPDi2ab14_ft4u-ot5Knvt-
gtNihrYDwuODs6uHp4dzvs47sv9ihsrK1sbnp5_fZpq_ep_bm97Whp-rq5t6nvt-
j7I7sqdih8eL33OKztpKnvt-gtdihrYDwuuTm7-fG6-fkgPD02aaysrW0s67s4pKnqN-
g6PLw3f7okqe1trK0sbax7OP-
tbTfoKnYoeW9q5Hq4tzv6ur36YDw9NmmsbvZpq_d_rGv8dvg7eHYobuA8P3X2KGu2abg7rC9
u_fYobjZprex7o7sqdih4ent4Om5juy_2KGy2aav3f63oOLt7efa6uzd_uiSp7W3urO1tLGA
8OLZpu7t6_Dr3f7okqe1sd6nqN-jv7qv9vfq8drq7N3-
6JKn3sXDtrWxsezi_rWwtrO3srHd_v6Sp_Ht6_HN593-
6JKnsLGysbHfo_CO7Ozg36C_2KGwgPDi2abn8Ozy5t3-6JKn19-gqdih5q6ikebr596nvt-
j7eL-2ab-__im_gAAAADddagR",
"currentFilterState": "",
"filterValues": []

   }

Response example

   {

"dataType": "UnitInfoResponseV2",

   "data": {

   "code": "10000/00"

"name": "ENGINE (Var.: 1/Rev.: 0)",

   "links": [

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"AW19KnV9ZCJ6AAF7YSQ5J2xse3R9AXthJDp3LBE7HAxoaQ5fKTYicnsofWQieUVpYD4yNj9
9ZHsYQEFVC2ZteiJyey1vbDZlfCIEfTc9ByQySH1raGBtAnt3WipnLDoFemUlBXlraWQbPy0
5A3xjIFoqdz4qBjswOgV5PFQ2bAwFenMCezhpZHsqLAV6ZQJ7bzY6SH1yBXo6MD4yaG1LMTE
FemUCe2oyMCJuaWkEfXIFeWtneis2BXplAntqNFQ2cwJ7ITo_KwckMkh9bGloZgJ7d1oqdzc
_Kis2LQY1aVQ2ZQJ7Ahkfamo0OCRvbmlsam9rbTRUNnMCey46NjA4am1LMTEFemUCe2sxOSZ
na2xhA3x1ByRlYiwCe2IDfGhuNjkham5paW9uaQckJEh9Nz0EfWQFeTdUNnMCezwtNy8-
WiouA3wKBH1yBXliaW0AMT8HMjE3L25UNmUCe2pmAnsme3U2c3w3MTt8Y3l9VDY2OgV6ZQJ7
ajY4SH1yBXosLT0HJDJvA3w0OS8aOC9nVDZlJQV6PD8tBGVncAN8YwR9bQsHJCRIfT02NDAr
KwckMkh9amlqA3x1ByRtejg3Nz0AMDYHJDJIfW9tYGlvbmtaKjgDfDQ3MSoxByQySH1vawR9
cgV5f211LQJ7YgN8a2s2MUh9cgV6PDY4KHVhZwAwNgR9ZAV5XE5VbG9raG9uaWsyPSVtaGsE
fXIFeXBtfDY9NT0AMDYHJDJIfW5uaW1mbG4_VDZzAns1KS0FeTxUNm5raWlqa2lrNzgkbwJ7
dAN8MD9aKi4DfGgEfXIFeWJ6fSk7BXplAnsIWio4A3w9OSYBNj1ZZXsxKjEEfWQFeTQxSH1y
BXo4LCkEZWdwA3xjBH1vaWtaKmkiI3t0fSswPyQyNiQCezE7AnthWiogbW5tbQN8dQcke2c7
AntiJAJ7Nmd4UD4qOAR9ZCIHJHtzLS4GOzA6BXk8VDZvAnt0A3wgPmd6SH1kBXptbmliWio4
A3wvOS03ODVybUh9ZAV6bgJ7d1oqYjo2MDszOwY1aVQ2ZQJ7aGhva2MzPS0DfHUEfSw8LW97
fTAwPAR9ZAV5NlQ2cwJ7KzgtBjhpbEh9ZAV6bwJ7d1oqYD48NT0cMT0-
WiouA3xoaG9uaXQ2OEh9cgV6MigqByQySH1vbGhua2xrNjkkb24FenMCez9ncUswOAY1MDAt
M1oqLgN8a2EDfHUHJGt1KwE6NzsCe2FaKicNAnt0A3w6NGpnYS0Ce2IDfG1rNFQ2cwJ7OzM3
OjNjVDZlAntoA3x1ByRtejg3Nz0AMDYHJDJIfW9tYGlvbmtaKjgDfDQ3MSoxByQySH1vawR9
cgV5ZWB1LC0wKwAwNgckMkh9BB8ZbG9razY4JG9qbGltaGsHJCRIfSs3MSsXPQckMkh9amto

a2sFeSpUNjY6BXplAntqWio4A3w9KjYoPAckMkh9DQV6cwJ7PHR4SzwxPQR9ZAV5NzgkA3wk
JSJ8JAAAAABH54tq"

   }

   ]

"imageMaps": [

   {

"imageName": "<https://img.altechopersys.com/YQAU1/source/746>

## /746115600.gif?s=338433312&k=019ce0655ca0b3cd9efb1dbe0e46cb9e"

   "areas": [

   {

   "x1": 1711

   "y1": 676

   "x2": 1765

   "y2": 730

"areaCode": "1"

   }

   {

   "x1": 1711

   "y1": 676

   "x2": 1765

   "y2": 730

"areaCode": "1"

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getUnitParts
This function allows to get a list of spare parts in a unit.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2

Response schema
"PartsSectionsResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/PartSectionsListV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, PartSectionsListV2Dto
Example of the previous step
"action": "getUnitParts",
"label": "Parts",

   "token"

"AQQUQxwUDUsTaWgSCE1QTgUFEh0UaBIITVMeRXhSdWUBAGc2QF9LGxJBFA1LECwACVdbX1Y
UDRJxKSg8Yg8EE0sbEkQGBV8MFUttFF5Ubk1bIRQCAQkEaxIeM0MORVNsEwxMbBACAA1yVkR
QahUKSTNDHldDb1JZU2wQVT1fBWVsExprElEADRJDRWwTDGsSBl9TIRQbbBNTWVdbAQQiWFh
sEwxrEgNbWUsHAABtFBtsEAIOE0JfbBMMaxIDXT1fGmsSSFNWQm5NWyEUBQABD2sSHjNDHl5
WQ0JfRG9cAD1fDGsSa3B2AwNdUU0GBwAFAwYCBF09XxprEkdTX1lRAwQiWFhsEwxrEgJYUE8
OAgUIahUcbk0MC0VrEgtqFQEHX1BIAwcAAAYHAG5NTSEUXlRtFA1sEF49XxprElVEXkZXM0N
HahVjbRQbbBALAARpWFZuW1heRgc9XwxrEgMPaxJPEhxfGhVeWFIVChAUPV9fU2wTDGsSA19
RIRQbbBNFRFRuTVsGahVdUEZzUUYOPV8MTGwTVVZEbQwOGWoVCm0UBGJuTU0hFFRfXVlCQm5
NWyEUAwADahUcbk0EE1FeXlRpWV9uTVshFAYECQAGBwIzQ1FqFV1eWENYbk1bIRQGAm0UG2w
QFgQcRGsSC2oVAgJfWCEUG2wTVV9RQRwIDmlZX20UDWwQNSc8BQYCAQYHAAJbVEwEAQJtFBt
sEBkEFV9UXFRpWV9uTVshFAcHAAQPBQdWPV8aaxJcQERsEFU9XwcCAAADAgACXlFNBmsSHWo
VWVYzQ0dqFQFtFBtsEAsTFEBSbBMMaxJhM0NRahVUUE9oX1QwDBJYQ1htFA1sEF1YIRQbbBN
RRUBtDA4ZahUKbRQGAAIzQwBLShIdFEJZVk1bX01rElhSaxIIM0NJBAcEBGoVHG5NEg5SaxI
LTWsSXw4ROVdDUW0UDUtuTRIaREdvUllTbBBVPV8GaxIdahVJVw4TIRQNbBMEBwALM0NRahV
GUEReUVwbBCEUDWwTB2sSHjNDC1NfWVJaUm9cAD1fDGsSAQEGAgpaVERqFRxtFEVVRAYSFFl
ZVW0UDWwQXz1fGmsSQlFEb1EABSEUDWwTBmsSHjNDCVdVXFR1WFRXM0NHahUBAQYHAB1fUSE
UG2wTW0FDbk1bIRQGBQEHAgUCX1BNBgdsExprElYOGCJZUW9cWVlEWjNDR2oVAghqFRxuTQI
cQmhTXlJrEggzQ05kaxIdahVTXQMOCERrEgtqFQQCXT1fGmsSUlpeU1oKPV8MaxIBahUcbk0
EE1FeXlRpWV9uTVshFAYECQAGBwIzQ1FqFV1eWENYbk1bIRQGAm0UG2wQDAkcRURZQmlZX25
NWyEUbXZwBQYCAl9RTQYDBQAEAQJuTU0hFEJeWEJ-
VG5NWyEUAwIBAgJsEEM9X19TbBMMaxIDM0NRahVUQ19BVW5NWyEUZGwTGmsSVR0RIlVYVG0U
DWwQXlFNahVNTEsVTQAAAADC8drb"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getUnitParts>: {

   "token"

"AQQUQxwUDUsTaWgSCE1QTgUFEh0UaBIITVMeRXhSdWUBAGc2QF9LGxJBFA1LECwACVdbX1Y
UDRJxKSg8Yg8EE0sbEkQGBV8MFUttFF5Ubk1bIRQCAQkEaxIeM0MORVNsEwxMbBACAA1yVkR
QahUKSTNDHldDb1JZU2wQVT1fBWVsExprElEADRJDRWwTDGsSBl9TIRQbbBNTWVdbAQQiWFh
sEwxrEgNbWUsHAABtFBtsEAIOE0JfbBMMaxIDXT1fGmsSSFNWQm5NWyEUBQABD2sSHjNDHl5

WQ0JfRG9cAD1fDGsSa3B2AwNdUU0GBwAFAwYCBF09XxprEkdTX1lRAwQiWFhsEwxrEgJYUE8
OAgUIahUcbk0MC0VrEgtqFQEHX1BIAwcAAAYHAG5NTSEUXlRtFA1sEF49XxprElVEXkZXM0N
HahVjbRQbbBALAARpWFZuW1heRgc9XwxrEgMPaxJPEhxfGhVeWFIVChAUPV9fU2wTDGsSA19
RIRQbbBNFRFRuTVsGahVdUEZzUUYOPV8MTGwTVVZEbQwOGWoVCm0UBGJuTU0hFFRfXVlCQm5
NWyEUAwADahUcbk0EE1FeXlRpWV9uTVshFAYECQAGBwIzQ1FqFV1eWENYbk1bIRQGAm0UG2w
QFgQcRGsSC2oVAgJfWCEUG2wTVV9RQRwIDmlZX20UDWwQNSc8BQYCAQYHAAJbVEwEAQJtFBt
sEBkEFV9UXFRpWV9uTVshFAcHAAQPBQdWPV8aaxJcQERsEFU9XwcCAAADAgACXlFNBmsSHWo
VWVYzQ0dqFQFtFBtsEAsTFEBSbBMMaxJhM0NRahVUUE9oX1QwDBJYQ1htFA1sEF1YIRQbbBN
RRUBtDA4ZahUKbRQGAAIzQwBLShIdFEJZVk1bX01rElhSaxIIM0NJBAcEBGoVHG5NEg5SaxI
LTWsSXw4ROVdDUW0UDUtuTRIaREdvUllTbBBVPV8GaxIdahVJVw4TIRQNbBMEBwALM0NRahV
GUEReUVwbBCEUDWwTB2sSHjNDC1NfWVJaUm9cAD1fDGsSAQEGAgpaVERqFRxtFEVVRAYSFFl
ZVW0UDWwQXz1fGmsSQlFEb1EABSEUDWwTBmsSHjNDCVdVXFR1WFRXM0NHahUBAQYHAB1fUSE
UG2wTW0FDbk1bIRQGBQEHAgUCX1BNBgdsExprElYOGCJZUW9cWVlEWjNDR2oVAghqFRxuTQI
cQmhTXlJrEggzQ05kaxIdahVTXQMOCERrEgtqFQQCXT1fGmsSUlpeU1oKPV8MaxIBahUcbk0
EE1FeXlRpWV9uTVshFAYECQAGBwIzQ1FqFV1eWENYbk1bIRQGAm0UG2wQDAkcRURZQmlZX25
NWyEUbXZwBQYCAl9RTQYDBQAEAQJuTU0hFEJeWEJ-
VG5NWyEUAwIBAgJsEEM9X19TbBMMaxIDM0NRahVUQ19BVW5NWyEUZGwTGmsSVR0RIlVYVG0U
DWwQXlFNahVNTEsVTQAAAADC8drb",
"currentFilterState": ""

   }

Response example

   {

"dataType": "PartsSectionsResponseV2",

   "data": {

"partSections": [

   {

   "parts": [

   {

"partNumber": "71751448",
"partName": "UNCOMPLETE-ENGINE",
"partNumberFormatted": "71751448",
"displayName": "UNCOMPLETE-ENGINE",

   "attributes": [

   {

   "code": "amount"

"label": "Quantity",

   "values": [

   "01"

   ]

   "type": "simple"

   }

   {

"code": "measurementUnit",
"label": "measurementUnit",

   "values": [

"Num"

   ]

   "type": "simple"

   }

   {

   "code": "macrofamily"

   "label": "macrofamily"

   "values": [

   "B"

   ]

   "type": "simple"

   }

   {

   "code": "family"

   "label": "family"

   "values": [

   "AA03"

   ]

   "type": "simple"

   }

   {

"code": "familyName",
"label": "familyName",

   "values": [

   "SEMICOMPLETE ENGINE"

   ]

   "type": "simple"

   }

   {

   "code": "pattern"

   "label": "pattern"

   "values": [

   "(KW99)"

   "KW99 - POWER: 1.4"

   ]

   "type": "simple"

   }

   {

   "code": "weigth"

   "label": "weigth"

   "values": [

   "83000"

   ]

   "type": "simple"

   }

   ]

"areaCode": "1"

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getGroups
That allows to get a structure of vehicle groups' tree.
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"GroupsTreeResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/GroupNodeV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, GroupNodeV2Dto
Example of the previous step
"action": "getGroups",
"label": "Groups",
"token": "AZ6O2YaOl9GJ8_KIktfK1J-fiIeO8oiS17Wh4-
b7_sHY_Jmk2sXRgYjbjpfRiruakf7Cxd_vws7N18HF6__l_vz-iITXuIbYzMbEy4-
Qira9ru35kp-O0IaKg5KDjpeI0PCPw8yp2d3wj5-
alJ_2itmnxd_ezveOl9H015aG3OnL383xiJKOp8XPzN70z8LO9NfBu46e-
PeOgfaKlpSLw9jY946X9orBy9Xwj4b3jsjEz5yVgvPDxfeOl_aKxM_fmpydm_CPhvTXlojC2
cL3jpf2isTJu46B9onVyMvaqdnd8I-Ym5yU9orZp8XPxcvY38TZ95uUu46X9on26-
ubxMnXnJ2am5iYm5rDybuOgfaJ2sjCwZaXgvPDxfeOl_aKxczWnpWfnpXxiISp2Yra3vaJlv
GImcDL1pmYmpudnZqYqdnL8I_Dz_CPkPTXyruOgfaJyN_D3pCnxZbxiPjwj4b015-
G1fLFzfPAxcaBk7uOl_aJnpT2ioiGmo7QAAAAAHV7gdQ=",
"code": "GROUPS"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getGroups>: {
"token": "AZ6O2YaOl9GJ8_KIktfK1J-fiIeO8oiS17Wh4-
b7_sHY_Jmk2sXRgYjbjpfRiruakf7Cxd_vws7N18HF6__l_vz-iITXuIbYzMbEy4-

Qira9ru35kp-O0IaKg5KDjpeI0PCPw8yp2d3wj5-
alJ_2itmnxd_ezveOl9H015aG3OnL383xiJKOp8XPzN70z8LO9NfBu46e-
PeOgfaKlpSLw9jY946X9orBy9Xwj4b3jsjEz5yVgvPDxfeOl_aKxM_fmpydm_CPhvTXlojC2
cL3jpf2isTJu46B9onVyMvaqdnd8I-Ym5yU9orZp8XPxcvY38TZ95uUu46X9on26-
ubxMnXnJ2am5iYm5rDybuOgfaJ2sjCwZaXgvPDxfeOl_aKxczWnpWfnpXxiISp2Yra3vaJlv
GImcDL1pmYmpudnZqYqdnL8I_Dz_CPkPTXyruOgfaJyN_D3pCnxZbxiPjwj4b015-
G1fLFzfPAxcaBk7uOl_aJnpT2ioiGmo7QAAAAAHV7gdQ=",
"currentFilterState": ""

   }

Response example

   {

"dataType": "GroupsTreeResponseV2",

   "data": {

"name": "Passenger Cars (NEW)",

   "children": [

   {

"name": "Service parts",

   "children": [

   {

   "token"

"AdLClcrC253Fv77E3puGmNPTxMvCvsTem_ntr6q3so2UsNXolomdzcSXwtudxujCwoOKoZW
PlJat3ZWRwtPEy8Kih5DY28SHw9zFo6evpe2Pn8KcysWWiILGg5XQvMOPg7zD3LibgprY07r
FzL3El8rT98LbnbvCjIeU_dbfgb3E3Zu9xIfYw_SDjoK7wtu6xorl98LNusWDjoqLzMX3wtu
6xdTR1Libm_fChIiAiY-
Du9fY98LbusXR1d7SiICbvMPKu8KMiYrN3_fC27rF0dO6xpXriZmEh5W8w9y4m4Wb0Ni6xcy
9xIfR1tiTiJW4jo66xoPribqnp9TR09bUiYeb1NTX1dbTusaV64mWhI6Og42Du9fY98LbusX
Q1tfWgYKe2b3Ey7zDi5LK64navcTW1dHX0YyHm9HR1te8w8q4m97PvMPcu8LQusaV64mEk4-
Rhb3E3uWV-LzDyrvChYed5tjNv4yJiZSJusaD64nS2LrFnZybxsQAAAAABI5_2g==",
"name": "Oil Filter",

   "code": "2"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AfrqveLq87Xtl5bs9rOusPv77OPqluz2s9HFh4KfmqW8mP3AvqG15ey_6vO17sDq6quiib2
nvL6F9b256vvs4-qKr7jw8-yv6_Tti4-HjcWnt-q04u2-oKruq734lOunq5Tr9JCzqrLw-
5Lt5JXsv-L73-rztZPqpK-81f73qZXs9bOV7K_w69yrpqqT6vOS7qLN3-
rlku2rpqKj5O3f6vOS7fz5_JCzs9_qrKCooaerk__w3-rzku35_fb6oKizlOvik-
qkoaLl99_q85Lt-fuS7r3DobGsr72U6_SQs62z-
PCS7eSV7K_5_vC7oL2QpqaS7qvDoZKPj_z5-_78oa-z_Pz__f77ku69w6G-
rKamq6Wrk__w3-rzku34_v_-qaq28ZXs45Tro7riw6Hylez-_fn_-aSvs_n5_v-U6-
KQs_bnlOv0k-r4ku69w6Gsu6e5rZXs9s290JTr4pPqra-
1zvDll6Shobyhku6rw6H68JLttbSz7uwAAAAAa8vlbg=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"Aczci9TcxYPboaDawIWYhs3N2tXcoNrAhefzsbSprJOKrsv2iJeD09qJ3MWD2ObF2dzF2o2
Mip3Yi4vki5abkrmNl4_X4NHcxdrL3NPaucbd1JKQn9vE3bu87ujhxsvahNLdjpPDi4_chKT
bl5uk2J31l8vOwMui3dSmhdrGmqPaw4Wj2pfG2fGfi5ml3MWDpoXK1Iqgm5aao9rA-
4uGrKPa1aLdm5XLxsCMo9rDot3MypX1l9Kj2pyQmJGUwvbbkaPaw6Ldyc6fn4TJz6Tb0qPal
8jHwZaj2sOi3cnI-4uZot2BnJ-NpNid9ZfMz8jAot3UpoXK3Z-Mi5CNoJaV-

4uPot2iv7_MyciXmYXOz8zMz83OyPuLmaLdjpyWlpuWwvbbkaPaw6LdyM2Wm43LysGl3NOk2
MrfxqLdwqXczs3KlpyAzs_Jyc7PpNiL9ZeXm6TbxKPay_uLmaLdnIuXiZ2mhZPp3Kyk29Kj2
p7G0OqRmaeUkZGMkvuLj6LdysCi3YWH2ovIAAAAAE5u7GU="

   }

   ]

   }

   {

   "token"

"Ad_PmMfP1pDIsrPJ05aLld7eycbPs8nTlvTgoqe6v4CZvdjlm4SQwMmaz9aQy-
XPz46HrJiCmZug0Jicz9_Jxs-vip3V1smKztHIrqqiqOCCks-
Rx8ibhY_Ljpjdsc6CjrHO0bWWj5fV3rfIwbDJmsfe-
s_WkLbPgYqZ8NvSjLDJ0JawyYrVzvmOg4-2z9a3y4fo-
s_At8iOg4eGwcj6z9a3yNnc2bWWlvrPiYWNhIKOttrV-s_Wt8jc2NPfhY2Wsc7Hts-
BhIfA0vrP1rfI3N63y5jmhJSJipixztG1loiW3dW3yMGwyYrc29WehZi1g4O3y47mhLeqqtn
c3tvZhIqW2dna2Nvet8uY5oSbiYODjoCOttrV-s_Wt8jd29rbjI-
T1LDJxrHOhp_H5oTXsMnb2Nza3IGKltzc29qxzse1ltPCsc7Rts_dt8uY5oSJnoKciLDJ0-
iY9bHOx7bPiIqQ69XAsoGEhJmEt8uO5oTf1bfIkJGWy8kAAAAA24dNuA==",
"name": "Air Filter",

   "code": "3"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AfrqveLq87Xtl5bs9rOusPv77OPqluz2s9HFh4KfmqW8mP3AvqG15ey_6vO17sDq6quiib2
nvL6F9b256vrs4-qKr7jw8-yv6_Tti4-HjcWnt-q04u2-oKruq734lOunq5Tr9JCzqrLw-
5Lt5JXsv-L73-rztZPqpK-81f73qZXs9bOV7K_w69yrpqqT6vOS7qLN3-
rlku2rpqKj5O3f6vOS7fz5_JCzs9_qrKCooaerk__w3-rzku35_fb6oKizlOvik-
qkoaLl99_q85Lt-fuS7r3DobGsr72U6_SQs62z-
PCS7eSV7K_5_vC7oL2QpqaS7qvDoZKPj_z5-_78oa-z_Pz__f77ku69w6G-
rKamq6Wrk__w3-rzku34_v_-qaq28ZXs45Tro7riw6Hylez-_fn_-aSvs_n5_v-U6-
KQs_bnlOv0k-r4ku69w6Gsu6e5rZXs9s290JTr4pPqra-
1zvDll6Shobyhku6rw6H68JLttbSz7uwAAAAAkxnJdA=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",
"token": "Abys-
6SstfOr0dCqsPXo9r29qqWs0Kqw9ZeDwcTZ3OP63ruG-Ofzo6r5rLXzqJa1qay1qv38-u2o-
_uU--br4sn95_-nkKGstaq6rKOqybatpOLg76u0rcvMnpiRtruq9KKt_uOz-_-s9NSr5-
vUqO2F57u-sLvSraTW9aq26tOqs_XTque2qYHv--nVrLXz1vW6pPrQ6-
bq06qwi_v23NOqpdKt6-
W7trD806qz0q28uuWF56LTquzg6OHksoar4dOqs9Ktub7v7_S5v9SrotOq57i3sebTqrPSrb
m4i_vp0q3x7O_91Kjthee8v7iw0q2k1vW6re_8--D90Obli_v_0q3Sz8-8ubjn6fW-
v7y8v72-
uIv76dKt_uzm5uvmsoar4dOqs9KtuL3m6_27urHVrKPUqLqvttKtstWsvr265uzwvr-
5ub6_1Kj7hefn69SrtNOqu4v76dKt7Pvn-
e3W9eOZrNzUq6LTqu62oJrh6dfk4eH84ov7_9KturDSrfX3qvu4AAAAAExggdI="

   }

   ]

   }

   {

"name": "Lights",

   "children": [

   {

"name": "Combination Rearlight/-Parts",

   "children": [

   {

"token": "AbOj9Kujuvyk3t-lv_rn-bKypaqj36W_-piMzsvW0-
z10bSJ9-j8rKX2o7r8p4mjo-LrwPTu9ffMvPTwo7m-taOspca5oqvt7-
Cku6LEw5GXnrm0pfutovHsvPTwo_vbpOjk26fiiui0sb-
03aKr2fqlueXcpbz63KXouaaO4PTm2qO6_Nn6tav13-Tp5dylv4T0-
dPcpardouTqtLm_89ylvN2is7Xqiuit3KXj7-
fu672JpO7cpbzdorax4OD7trDbpK3cpei3uL7p3KW83aK2t4T05t2i_uPg8tun4oros7C3v9
2iq9n6taLg8_Tv8t_p6oT08N2i3cDAs7a36Ob6sbCzs7CysbeE9ObdovHj6enk6b2JpO7cpb
zdorey6eTytLW-
2qOs26e1oLndor3ao7Gytenj_7GwtraxsNun9Iro6OTbpLvcpbSE9ObdouP06Pbi2frslqPT
26St3KXhua-V7ubY6-7u8-2E9PDdorW_3aL6-KX0twAAAAAZm6ov",
"name": "Combination Rearlight",

   "code": "993"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",
"token": "Af3tuuXt9LLqkJHr8bSpt_z86-
TtkevxtNbCgIWYnaK7n_rHuaay4uu47fSy6cft7ayljrqgu7mC8rq-7ffw--
3i64j37OWjoa7q9eyKjd_Z0Pf667Xj7L-i8rq-7bWV6qaqlemsxKb6__H6k-
zll7Tr96uS6_K0kuum9-jArrqolO30spe0--W7kaqnq5Lr8cq6t52S6-ST7Kqk-
vfxvZLr8pPs_fukxKbjkuutoamgpfPH6qCS6_KT7Pj_rq61-P6V6uOS66b59vCnkuvyk-z4-
cq6qJPssK2uvJXprMSm_f758ZPs5Ze0--
yuvbqhvJGnpMq6vpPsk46O_fj5pqi0__79_f78__nKuqiT7L-
tp6eqp_PH6qCS6_KT7Pn8p6q8-vvwlO3ilen77veT7POU7f_8-6etsf_--
Pj__pXpusSmpqqV6vWS6_rKuqiT7K26prisl7Si2O2dlerjkuuv9-
HboKiWpaCgvaPKur6T7Pvxk-y0tuu6-QAAAAAHa35d"

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"ASU1Yj01LGoySEkzKWxxbyQkMzw1STMpbA4aWF1ARXpjRyIfYX5qOjNgNSxqMQ8sMDUsM2R
lY3QxYmINYn9ye1BkfmY-
CTg1LDMpLiUzP2wDPWN3fX9wNCsxDQYVVkIpJDVrPTE4KTg1LDNrSzR4dxJiZks0JCEvJE0x

## Yhx-

ZGV1TDUsak9sLT1nUnBkdkozKTUcfnR3ZU90eXVPbHoANSVDTDU6TTEtLzB4Y2NMNSxNMXpw
bks0PUw1c390Jy45SHh-
TDUsTTF_dGQhJyYgSzQ9T2wtM3lieUw1LE0xf3IANTpNMm5zcGESYmZLNCMgJy9NMWIcfnR-
cGNkf2JMIC8ANSxNMk1QUCB_cmwnJiEgIyMgIXhyADU6TTJhc3l6LSw5SHh-TDUsTTF-
d20lLiQlLkozPxJiMWFlTTItSjMie3BtIiMhICYmISMSYnBLNHh0SzQrT2xxADU6TTJzZHhl
Kxx-LUozQ0s0PU9sJD1uSX52SHt-fTooADUsTTIlL00xMz0hNWsAAAAAkKtnqQ=="

   }

   ]

   }

   ]

   }

   {

"name": "Tail Light/ Parts",

   "children": [

   {

   "token"

"AcjYj9DYwYffpaTexIGcgsnJ3tHYpN7EgeP3tbCtqJeOqs_yjJOH196N2MGH3PLY2JmQu4-
Vjoy3x4-L2MLFxdjX3r3C2dCWlJvfwNm_uOrs5cLP3oDW2YqXx4-
L2ICg35OfoNyZ8ZPPysTPptnQooHewp6n3seBp96Twt31m4-dodjBh6KBztCOpJ-SnqfexP-
Pgqin3tGm2Z-

Rz8LEiKfex6bZyM6R8ZPWp96YlJyVkMby35Wn3sem2c3Km5uAzcug39an3pPMw8WSp97Hptn
NzP-PnabZhZibiaDcmfGTyMvMxKbZ0KKBztmbiI-UiaSSkf-
Pi6bZpru7yM3Mk52BysvIyMvJysz_j52m2YqYkpKfksby35Wn3sem2czJkp-
Jz87FodjXoNzO28Km2cah2MrJzpKYhMrLzc3Ky6Dcj_GTk5-
g38Cn3s__j52m2ZiPk42ZooGX7diooN_Wp96awtTulZ2jkJWViJb_j4um2c7EptmBg96PzAA
AAACDiisC",
"name": "Tail Light Bulb",

   "code": "998"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AUdXAF9XTghQKitRSw4TDUZGUV5XK1FLDmx4Oj8iJxgBJUB9AxwIWFECV04IU31XVxYfNAA
aAQM4SAAEV01KSldYUTJNVl8ZGxRQT1YwN2Vjak1AUQ9ZVgUYSAAEVw8vUBwQL1MWfhxARUt
AKVZfLQ5RTREoUUgOKFEcTVJ6FAASLldOCC0OQV8BKxAdEShRS3AADScoUV4pVhAeQE1LByh
RSClWR0EefhxZKFEXGxMaH0l9UBooUUgpVkJFFBQPQkQvUFkoURxDTEodKFFIKVZCQ3AAEil
WChcUBi9TFn4cR0RDSylWXy0OQVYUBwAbBisdHnAABClWKTQ0R0JDHBIORURHR0RGRUNwABI
pVgUXHR0QHUl9UBooUUgpVkNGHRAGQEFKLldYL1NBVE0pVkkuV0VGQR0XC0VEQkJFRC9TAH4
cHBAvUE8oUUBwABIpVhcAHAIWLQ4YYlcnL1BZKFEVTVthGhIsHxoaBxlwAAQpVkFLKVYODFE
AQwAAAABcKkuF"

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AXZmMW5mfzlhGxpgej8iPHd3YG9mGmB6P11JCw4TFikwFHFMMi05aWAzZn85Ylx_Y2Z_YDc
2MCdiMTFeMSwhKAM3LTVtWmtmf2B6fX1gbD9QbjAkLiwjZ3hiXlVGBRF6d2Y4bmJremtmf2A
4GGcrJEExNRhnd3J8dx5iMU8tNzYmH2Z_ORw_fm40ASM3JRlgemZPLSckNhwnKiYcPylTZnY
QH2ZpHmJ-fGMrMDAfZn8eYikjPRhnbh9mICwndH1qGystH2Z_HmIsJzdydHVzGGduHD9-
YCoxKh9mfx5iLCFTZmkeYT0gIzJBMTUYZ3BzdHweYjFPLSctIzA3LDEfc3xTZn8eYR4DA3Ms
IT90dXJzcHBzcishU2ZpHmEyICopfn9qGystH2Z_HmItJD52fXd2fRlgbEExYjI2HmF-
GWBxKCM-
cXByc3V1cnBBMSMYZysnGGd4HD8iU2ZpHmEgNys2eE8tfhlgEBhnbhw_d249Gi0lGygtLml7
U2Z_HmF2fB5iYG5yZjgAAAAA18_Ymg=="

   }

   ]

   }

   ]

   }

   {

"name": "Stop Light/ Parts",

   "children": [

   {

   "token"

"AQwcSxQcBUMbYWAaAEVYRg0NGhUcYBoARSczcXRpbFNKbgs2SFdDExpJHAVDGDYcHF1Uf0t
RSkhzA0tPHA4ICQ0dFBgkCAFfU1deHAUaeSEgNGoHDBtDExpMDg1XBB1DZRxWXGZFUykcCgk
BDGMaFjtLBk1bZBsERGQYCggFel5MWGIdAkE7SxZfS2daUVtkGF01Vw1tZBsSYxpZCAUaS01
kGwRjGg5XWykcE2QbW1FfUwkMKlBQZBsEYxoLU1FDDwgIZRwTZBgKBhtKV2QbBGMaC1U1VxJ
jGkBbXkpmRVMpHA0ICQdjGhY7SxZWXktKV0xnVAg1VwRjGmN4fgsLVVlFDg8IDQsOCgxVNVc
SYxpPW1dRWQsMKlBQZBsEYxoKUFhHBgoNAGIdFGZFBANNYxoDYh0JD1dYQAsPCAgODwhmRUU
pHFZcZRwFZBhWNVcSYxpdTFZOXztLT2Ida2UcE2QYAwgMYVBeZlNQVk4PNVcEYxoLB2MaRxo
UV0MAAAAAku-LSQ==",
"name": "Bulb, stop light",

   "code": "1003"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",
"token": "AfLiteri-73ln57k_rumuPPz5OvinuT-
u9nNj4qXkq20kPXItqm97eS34vu95sji4qOqgbWvtLaN_bWx4vD29_Pj6uba9v-
hramg4vvkh9_eypT58uW97eSy8POp-uO9m-Koopi7rdfi9Pf_8p3k6MW1-
LOlmuX6uprm9Pb7hKCyppzj_L_FteihtZmkr6Wa5qPLqfOTmuXsneSn9vvktbOa5fqd5PCpp
dfi7Zrlpa-hrffy1K6umuX6neT1ra-98fb2m-Ltmub0-OW0qZrl-
p3k9avLqeyd5L6loLSYu63X4vP29_md5OjFteiooLW0qbKZqvbLqfqd5J2GgPX1q6e78PH28
_Xw9PKry6nsneSxpamvp_Xy1K6umuX6neT0rqa5-PTz_pzj6pi7-
v2zneT9nOP38ammvvXx9vbw8faYu7vX4qiim-
L7muaoy6nsneSjsqiwocW1sZzjlZvi7Zrm_fbyn66gmK2uqLDxy6n6neT1-
Z3kueTqqb0AAAAARs0aXQ=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AUxcC1RcRQNbISBaQAUYBk1NWlVcIFpABWdzMTQpLBMKLkt2CBcDU1oJXEUDWGZFWVxFWg0
MCh1YCwtkCxYbEjkNFw9XYFFcRVpITk9LWAsLdh8LGRURGFpABWpzNz4sQUpdBVYFX1waXUJ
bBSNaE0N1F0QjWkxPR0omBQVpXAwLHSJdQgF7C1gfDzwYCh4kWB1SaVwcGQ0hHBceewsPIl1
LKyJdVCYFSloSEA0LIl1CJgUdBUwjWlUiXR0UQEBbGyAWFiJdQiYFGAFGSUlOTiNaVnsLWBE
RDBEiXUImBRgHIl1UJVwGHRtVdRdEI1pLTk9BJgUFaVwcEBgNDBEJeEdaIl1CJVwlPjsUGAd
OT0hJTktNSxUfByJdVCVcCR0STkpZGyAWFiJdQiYFGQJPTUBMS0YkWAt1FxMJCyVcRSRYFhw
FT0pNSU5OSEoXdRdSI1oQGiNaQHsLBCJdVCVcGwoTUUxpXEUkWy0jWlZ7C1EfBicWGCAVFUl
dXSJdQiVcTUEmBVRIA10FAAAAAC9IMrw="

   }

   ]

   }

   ]

   }

   {

"name": "Indicator/ Parts",

   "children": [

   {

   "token"

"ATcncC8nPnggWlshO35jfTY2IS4nWyE7fhwISk9SV2hxVTANc2x4KCFyJz54Iw0nJ2ZvRHB
qcXNIOHB0JzUzMjAmLyMfMzpkaGxlJz4hQhobD1E8NyB4KCF3NTZsPyZ4XidtZ11-
aBInMTI6N1ghLQBwPXZgXyA_f18jMTM-
QWV3Y1kmOXoAcC1kcFxhamBfI2YObDZWXyApWCFiMz4hcHZfID9YITVsYBInKF8gYGpkaDI3
EWtrXyA_WCEwaGp4NDMzXicoXyMxPSBxbF8gP1ghMG4ObClYIXtgZXFdfmgSJzYzMjxYIS0A
cC1tZXBxbHdcbzMObD9YIVhDRTAwbmJ-
NTQzNjA1MTduDmwpWCF0YGxqYjA3EWtrXyA_WCExa2N8PTE2O1kmL11-
Pzh2WCE4WSYyNGxjezA0MzM1NDNdfn4SJ21nXic-
XyNtDmwpWCFmd211ZABwdFkmUF4nKF8jODM3WmtlXWhrbXU0Dmw_WCEwPFghfCEvbHgAAAAA
rI7JBg==",
"name": "Indicator",

   "code": "1005"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AcjYj9DYwYffpaTexIGcgsnJ3tHYpN7EgeP3tbCtqJeOqs_yjJOH196N2MGH3PLY2JmQu4-
Vjoy3x4-L2MrMzc_Z0NzgzMWbl5Oa2MHeveXk8K7DyN-H196IysmTwNmHodiSmKKBl-
3Yzs3FyKfe0v-PwomfoN_AgKDczszBvpqInKbZxoX_j9Kbj6OelZ-
g3Jnxk8mpoN_Wp96dzMHej4mg38Cn3sqTn-
3Y16Dfn5Wbl83I7pSUoN_Ap97Pl5WHy8zModjXoNzOwt-

Ok6DfwKfez5Hxk9an3oSfmo6igZft2MnMzcOn3tL_j9KSmo-
Ok4ijkMzxk8Cn3qe8us_PkZ2BysvMyc_KzsiR8ZPWp96Ln5OVnc_I7pSUoN_Ap97OlJyDws7
JxKbZ0KKBwMeJp97HptnNy5OchM_LzMzKy8yigYHt2JKYodjBoNyS8ZPWp96ZiJKKm_-
Pi6bZr6HY16Dcx8zIpZSaopeUkorL8ZPAp97Pw6feg97Qk4cAAAAAI2J88w=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AR4OWQYOF1EJc3IIEldKVB8fCAcOcggSVzUhY2Z7fkFYfBkkWkVRAQhbDhdRCjQXCw4XCF9
eWE8KWVk2WURJQGtfRV0FMgMOFwgaHB0fCllZJE1ZS0dDSggSVzghZWx-
ExgPVwRXDQ5IDxAJV3EIQREnRRZxCB4dFRh0V1c7Dl5ZT3APEFMpWQpNXW5KWEx2Ck8AOw5O
S19zTkVMKVldcA8ZeXAPBnRXGAhAQl9ZcA8QdFdPVx5xCAdwD09GEhIJSXJERHAPEHRXSlMU
GxscHHEIBClZCkNDXkNwDxB0V0pVcA8Gdw5UT0kHJ0UWcQgZHB0TdFdXOw5OQkpfXkNbKhUI
cA8Qdw53bGlGSlUcHRobHBkfGUdNVXAPBncOW09AHBgLSXJERHAPEHRXS1AdHxIeGRR2Clkn
RUFbWXcOF3YKRE5XHRgfGxwcGhhFJ0UAcQhCSHEIEilZVnAPBncOSVhBAx47Dhd2CX9xCAQp
WQNNVHVESnJHRxsPD3APEHcOHxN0VwYaUQ9XAAAAAK-cmaQ="

   }

   ]

   }

   {

"token": "AZqK3YKKk9WN9_aMltPO0JubjIOK9oyW07Gl5-L_-
sXc-
J2g3sHVhYzfipPVjqCKisvC6d3H3N7lld3Zipien56Lgo6ynpfJxcHIipOM77e2ovyRmo3Vh
YzamJvBkovV84rAyvDTxb-KnJ-
XmvWMgK3dkNvN8o2S0vKOnJ6T7MjazvSLlNet3YDJ3fHMx83yjsujwZv78o2E9YzPnpOM3dv
yjZL1jJjBzb-KhfKNzcfJxZ-
avMbG8o2S9YydxcfVmZ6e84qF8o6ckI3cwfKNkvWMncOjwYT1jNbNyNzw08W_ipuen5H1jIC
t3YDAyN3cwdrxwp6jwZL1jPXu6J2dw8_TmJmem52YnJrDo8GE9YzZzcHHz52avMbG8o2S9Yy
cxs7RkJyblvSLgvDTkpXb9YyV9IufmcHO1p2Znp6YmZ7w09O_isDK84qT8o7Ao8GE9YzL2sD
Yya3d2fSL_fOKhfKOlZ6a98bI8MXGwNiZo8GS9YydkfWM0YyCwdUAAAAAZQpnFg==",
"name": "Side Indicator",

   "code": "1006"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AUJSBVpSSw1VLy5UTgsWCENDVFtSLlROC2l9PzonIh0EIEV4BhkNXVQHUksNVnhSUhMaMQU
fBAY9TQUBUkBGR0ZTWlZqRk8RHRkQUktUN29ueiRJQlUNXVQCQEMZSlMNK1IYEigLHWdSREd
PQi1UWHUFSAMVKlVKCipWREZLNBACFixTTA91BVgRBSkUHxUqVhN7GUMjKlVcLVQXRktUBQM
qVUotVEAZFWdSXSpVFR8RHUdCZB4eKlVKLVRFHR8NQUZGK1JdKlZESFUEGSpVSi1URRt7GVw
tVA4VEAQoCx1nUkNGR0ktVFh1BVgYEAUEGQIpGkZ7GUotVC02MEVFGxcLQEFGQ0VAREIbexl
cLVQBFRkfF0VCZB4eKlVKLVREHhYJSERDTixTWigLSk0DLVRNLFNHQRkWDkVBRkZAQUYoCwt
nUhgSK1JLKlYYexlcLVQTAhgAEXUFASxTJStSXSpWTUZCLx4QKB0eGABBexlKLVRFSS1UCVR
aGQ0AAAAAEOaX6g=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AYubzJObgsSc5uedh8LfwYqKnZKb552HwqC09vPu69TN6Yyxz9DElJ3Om4LEn6GCnpuCncr
LzdqfzMyjzNHc1f7K0MiQp5abgp2PiYiJn8zMsdjM3tLW352Hwq208Pnrho2awpHCmJvdmoW
cwuSd1ISy0IPknYuIgI3hwsKum8vM2uWahca8zJ_YyPvfzdnjn9qVrpvb3srm29DZvMzI5Zq
M7OWak-
HCjZ3V18rM5ZqF4cLawovknZLlmtrTh4ec3OfR0eWaheHC38aBjo6JieSdkbzMn9bWy9blmo
Xhwt_A5ZqT4pvB2tySstCD5J2MiYiG4cLCrpvb19_Ky9bOv4Cd5ZqF4pvi-fzT38CJiI-

OiYyKjNLYwOWak-
KbztrViY2e3OfR0eWaheHC3sWIioeLjIHjn8yy0NTOzOKbguOf0dvCiI2KjomJj43QstCV5J
3X3eSdh7zMw-Wak-Kb3M3Ulouum4LjnOrknZG8zJbYweDR3-
fS0o6amuWaheKbiobhwpOPxJrCAAAAAOB5l-M="

   }

   ]

   }

   {

   "token"

"AW19KnV9ZCJ6AAF7YSQ5J2xse3R9AXthJEZSEBUIDTIrD2pXKTYicnsofWQieVd9fTw1Hio
wKykSYioufW9paGd8dXlFaWA-
MjY_fWR7GEBBVQtmbXoicnstb2w2ZXwiBH03PQckMkh9a2hgbQJ7d1oqZyw6BXplJQV5a2lk
Gz8tOQN8YyBaKnc-KgY7MDoFeTxUNmwMBXpzAns4aWR7KiwFemUCe282Okh9cgV6OjA-
MmhtSzExBXplAntqMjAibmlpBH1yBXlrZ3orNgV6ZQJ7ajRUNnMCeyE6PysHJDJIfWxpaGYC
e3daKnc3PyorNi0GNWlUNmUCewIZH2pqNDgkb25pbGpva200VDZzAnsuOjYwOGptSzExBXpl
AntrMTkmZ2tsYQN8dQckZWIsAntiA3xobjY5IWpuaWlvbmkHJCRIfTc9BH1kBXk3VDZzAns8
LTcvPloqLgN8CgR9cgV5YmltADE_BzIxNy9uVDZlAntqZgJ7Jnt1NiIAAAAAjS5kYw==",
"name": "Bulb, indicator",

   "code": "1008"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",
"token": "Aam57rG5oOa-xMW_peD946iov7C5xb-
l4IKW1NHMyfbvy66T7fLmtr_suaDmvZO5ufjx2u707-
3Wpu7quautrKO4sb2BraT69vL7uaC_3ISFkc-iqb7mtr_pq6jyobjmwLnz-
cPg9oy5r6ykqca_s57uo-j-wb6h4cG9r62g3_vp_ce4p-
Se7rP67sL_9P7BvfiQ8qjIwb63xr_8raC_7ujBvqHGv6vy_oy5tsG-
_vT69qypj_X1wb6hxr-u9vTmqq2twLm2wb2vo77v8sG-oca_rvCQ8rfGv-X---
_D4PaMuaitrKLGv7Oe7rPz--
7v8unC8a2Q8qHGv8bd266u8Pzgq6qtqK6rr6nwkPK3xr_q_vL0_K6pj_X1wb6hxr-
v9f3io6-opce4scPgoaboxr-
mx7isqvL95a6qra2rqq3D4OCMufP5wLmgwb3zkPK3xr_46fPr-
p7u6se4zsC5tsG9pq2pxPX7w_b18-uqkPKhxr-uosa_4r-x8uYAAAAAQ9xxRg=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",
"token": "AbKi9aqiu_2l396kvvvm-LOzpKui3qS--
5mNz8rX0u300LWI9un9raT3orv9ppi7p6K7pPPy9OOm9fWa9ejl7Mfz6fGpnq-iu6S2sLG-
pvX1iOH15-vv5qS--5SNycDSv7Sj-6j7oaLko7yl-92k7b2L6brdpLKxubTY-
_uXovL149yjvP-
F9abh8cLm9ODapuOsl6Li5_Pf4unghfXx3KO11dyjqtj7tKTs7vP13KO82Pvj-7LdpKvco-
Pqvr6l5d7o6NyjvNj75v-4t7ewsN2kqIX1pu_v8u_co7zY--b53KOq26L44-Wri-
m63aS1sLG_2Pv7l6Li7ubz8u_3hrmk3KO826LbwMXq5vmwsba3sLWztevh-dyjqtui9-
PssLSn5d7o6NyjvNj75_yxs76ytbjapvWL6e339duiu9qm6OL7sbSzt7CwtrTpi-
ms3aTu5N2kvoX1-tyjqtui5fTtr7KXorvapdPdpKiF9a_h-Nno5t7r67ejo9yjvNuis7_Y-
6q2_aP7AAAAAJTxX7M="

   }

   ]

   }

   ]

   }

   {

   "token"

"ATEhdikhOH4mXF0nPXhlezAwJyghXSc9eBoOTElUUW53UzYLdWp-Lid0ITh-
JQshIWBpQnZsd3VOPnZyITM1NDogKSUZNTxibmpjITgnRBwdCVc6MSZ-LidxMzBqOSB-

WCFrYVt4bhQhNzQ8MV4nKwZ2O3BmWSY5eVklNzU4R2NxZV8gP3wGditidlpnbGZZJWAIajBQ
WSYvXidkNTgndnBZJjleJzNqZhQhLlkmZmxibjQxF21tWSY5Xic2bmx-
MjU1WCEuWSU3OyZ3alkmOV4nNmgIai9eJ31mY3dbeG4UITA1NDpeJysGditrY3Z3anFaaTUI
ajleJ15FQzY2aGR4MzI1MDYzNzFoCGovXidyZmpsZDYxF21tWSY5Xic3bWV6OzcwPV8gKVt4
OT5wXic-
XyA0MmplfTYyNTUzMjVbeHgUIWthWCE4WSVrCGovXidgcWtzYgZ2cl8gVlghLlklPjUxXG1j
W25ta3MyCGo5Xic2Ol4neicpan4AAAAAUaTQPw==",
"name": "Licence Plate Light/-Parts",

   "code": "1009"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AXBgN2hgeT9nHRxmfDkkOnFxZmlgHGZ8OVtPDQgVEC82EndKNCs_b2Y1YHk_ZEpgYCEoAzc
tNjQPfzczYHJ0dXthaGRYdH0jLysiYHlmBV1cSBZ7cGc_b2YwcnEreGE_GWAqIBo5L1VgdnV
9cB9makc3ejEnGGd4OBhkdnR5BiIwJB5hfj1HN2ojNxsmLScYZCFJK3ERGGduH2YldHlmNzE
YZ3gfZnIrJ1VgbxhnJy0jL3VwViwsGGd4H2Z3Ly0_c3R0GWBvGGR2emc2KxhneB9mdylJK24
fZjwnIjYaOS9VYHF0dXsfZmpHN2oqIjc2KzAbKHRJK3gfZh8EAnd3KSU5cnN0cXdydnApSSt
uH2YzJystJXdwViwsGGd4H2Z2LCQ7enZxfB5haBo5eH8xH2Z_HmF1cyskPHdzdHRyc3QaOTl
VYCogGWB5GGQqSStuH2YhMCoyI0c3Mx5hFxlgbxhkf3RwHSwiGi8sKjJzSSt4H2Z3ex9mO2Z
oKz8AAAAAlSyJQQ=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",
"token": "AQERRhkRCE4WbG0XDUhVSwAAFxgRbRcNSCo-
fHlkYV5HYwY7RVpOHhdEEQhOFSsIFBEIF0BBR1AVRkYpRltWX3RAWkIaLRwRCBcFAwIMFUZG
O1JGVFhcVRcNSCc-
enNhDAcQSBtIEhFXEA8WSG4XXg44WgluFwECCgdrSEgkEUFGUG8QD0w2RhVSQnFVR1NpFVAf
JBFRVEBsUVpTNkZCbxAGZm8QGWtIBxdfXUBGbxAPa0hQSAFuFxhvEFBZDQ0WVm1bW28QD2tI
VUwLBAQDA24XGzZGFVxcQVxvEA9rSFVKbxAZaBFLUFYYOFoJbhcGAwIMa0hIJBFRXVVAQVxE
NQoXbxAPaBFoc3ZZVUoDAgUEAwYABlhSSm8QGWgRRFBfAwcUVm1bW28QD2tIVE8CAA0BBgtp
FUY4Wl5ERmgRCGkVW1FIAgcABAMDBQdaOFofbhddV24XDTZGSW8QGWgRVkdeHAEkEQhpFmBu
Fxs2RhxSS2pbVW1YWAQQEG8QD2gRAAxrSBkFThBIAAAAAJ611dA="

   }

   ]

   "children": [

   {

   "token"

"Ac3ditXdxILaoKHbwYSZh8zM29TdodvBhObysLWorZKLr8r3iZaC0tuI3cSC2ffd3ZyVvoq
Qi4mywoqO3c_Jyc3c1dnlycCekpaf3cTbuODh9avGzdqC0tuNz8yWxdyCpN2XnaeEkujdy8j
AzaLb1_qKx4yapdrFhaXZy8nEu5-
NmaPcw4D6iteeiqabkJql2Zz0lsyspdrTotuYycTbioyl2sWi28-
Wmujd0qXampCeksjN65GRpdrFotvKkpCCzsnJpN3SpdnLx9qLlqXaxaLbypT0ltOi24Gan4u
nhJLo3czJyMai29f6iteXn4qLlo2mlcn0lsWi26K5v8rKlJiEz87JzMrPy82U9JbTotuOmpa
QmMrN65GRpdrFotvLkZmGx8vMwaPc1aeExcKMotvCo9zIzpaZgcrOycnPzsmnhITo3ZedpN3
EpdmX9JbTotucjZePnvqKjqPcqqTd0qXZwsnNoJGfp5KRl4_O9JbFotvKxqLbhtvVloIAAAA
AttIoBA==",
"name": "Licence Plate Light Bulb",

   "code": "1012"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"ARoKXQIKE1UNd3YMFlNOUBsbDAMKdgwWUzElZ2J_ekVceB0gXkFVBQxfChNVDiAKCktCaV1

HXF5lFV1ZChgeHhoLAg4yHhdJRUFIChMMbzc2InwRGg1VBQxaGBtBEgtVcwpASnBTRT8KHB8
XGnUMAC1dEFtNcg0SUnIOHB4TbEhaTnQLFFctXQBJXXFMR01yDksjQRt7cg0EdQxPHhMMXVt
yDRJ1DBhBTT8KBXINTUdJRR8aPEZGcg0SdQwdRUdVGR4ecwoFcg4cEA1cQXINEnUMHUMjQQR
1DFZNSFxwU0U_ChseHxF1DAAtXQBASF1cQVpxQh4jQRJ1DHVuaB0dQ09TGBkeGx0YHBpDI0E
EdQxZTUFHTx0aPEZGcg0SdQwcRk5REBwbFnQLAnBTEhVbdQwVdAsfGUFOVh0ZHh4YGR5wU1M
_CkBKcwoTcg5AI0EEdQxLWkBYSS1dWXQLfXMKBXIOFR4ad0ZIcEVGQFgZI0ESdQwdEXUMUQw
CQVUAAAAAKMcN1Q=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AQgYTxAYAUcfZWQeBEFcQgkJHhEYZB4EQSM3dXBtaFdOag8yTFNHFx5NGAFHHCIBHRgBHkl
ITlkcT08gT1JfVn1JU0sTJBUYAR4MCgoOHE9PMltPXVFVXB4EQS43c3poBQ4ZQRJBGxheGQY
fQWceVwcxUwBnHggLAw5iQUEtGEhPWWYZBkU_TxxbS3hcTlpgHFkWLRhYXUllWFNaP09LZhk
Pb2YZEGJBDh5WVElPZhkGYkFZQQhnHhFmGVlQBAQfX2RSUmYZBmJBXEUCDQ0KCmceEj9PHFV
VSFVmGQZiQVxDZhkQYRhCWV8RMVMAZx4PCgsFYkFBLRhYVFxJSFVNPAMeZhkGYRhhen9QXEM
KCwwNCg8JD1FbQ2YZEGEYTVlWCg4dX2RSUmYZBmJBXUYLCQQIDwJgHE8xU1dNT2EYAWAcUlh
BCw4JDQoKDA5TMVMWZx5UXmceBD9PQGYZEGEYX05XFQgtGAFgH2lnHhI_TxVbQmNSXGRRUQ0
ZGWYZBmEYCQViQRAMRxlBAAAAAO2OOy4="

   }

   ]

   }

   ]

   }

   {

"name": "Rear Fog Light/ Parts",

   "children": [

   {

   "token"

"ATYmcS4mP3khW1ogOn9ifDc3IC8mWiA6fx0JS05TVmlwVDEMcm15KSBzJj95IgwmJmduRXF
rcHJJOXF1JjQyMjInLiIeMjtlaW1kJj8gQxsaDlA9NiF5KSB2NDdtPid5XyZsZlx_aRMmMDM
7NlkgLAFxPHdhXiE-
fl4iMDI_QGR2YlgnOHsBcSxlcV1ga2FeImcPbTdXXiEoWSBjMj8gcXdeIT5ZIDRtYRMmKV4h
YWtlaTM2EGpqXiE-
WSAxaWt5NTIyXyYpXiIwPCFwbV4hPlkgMW8PbShZIHphZHBcf2kTJjcyMz1ZICwBcSxsZHFw
bXZdbjIPbT5ZIFlCRDExb2N_NDUyNzE0MDZvD20oWSB1YW1rYzE2EGpqXiE-
WSAwamJ9PDA3OlgnLlx_Pjl3WSA5WCczNW1iejE1MjI0NTJcf38TJmxmXyY_XiJsD20oWSBn
dmx0ZQFxdVgnUV8mKV4iOTI2W2pkXGlqbHQ1D20-WSAxPVkgfSAubXkAAAAA2N203g==",
"name": "Bulb, rear fog light",

   "code": "1016"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"ATAgdyggOX8nXVwmPHlkejExJikgXCY8eRsPTUhVUG92UjcKdGt_LyZ1IDl_JAogIGFoQ3d
tdnRPP3dzIDI0NDQhKCQYND1jb2tiIDkmRR0cCFY7MCd_LyZwMjFrOCF_WSBqYFp5bxUgNjU
9MF8mKgd3OnFnWCc4eFgkNjQ5RmJwZF4hPn0Hdypjd1tmbWdYJGEJazFRWCcuXyZlNDkmd3F
YJzhfJjJrZxUgL1gnZ21jbzUwFmxsWCc4XyY3b21_MzQ0WSAvWCQ2Oid2a1gnOF8mN2kJay5
fJnxnYnZaeW8VIDE0NTtfJioHdypqYnd2a3BbaDQJazhfJl9EQjc3aWV5MjM0MTcyNjBpCWs
uXyZzZ2ttZTcwFmxsWCc4XyY2bGR7OjYxPF4hKFp5OD9xXyY_XiE1M2tkfDczNDQyMzRaeXk
VIGpgWSA5WCRqCWsuXyZhcGpyYwd3c14hV1kgL1gkPzQwXWxiWm9sanIzCWs4XyY3O18meyY
oa38AAAAA2who2Q=="

   }

   {

"action": "getGroupPartsAll",

"label": "List quick details including all",

   "token"

"AR4OWQYOF1EJc3IIEldKVB8fCAcOcggSVzUhY2Z7fkFYfBkkWkVRAQhbDhdRCjQXCw4XCF9
eWE8KWVk2WURJQGtfRV0FMgMOFwgaHBwcCllZJE1ZS0dDSggSVzghZWx-
ExgPVwRXDQ5IDxAJV3EIQREnRRZxCB4dFRh0V1c7Dl5ZT3APEFMpWQpNXW5KWEx2Ck8AOw5O
S19zTkVMKVldcA8ZeXAPBnRXGAhAQl9ZcA8QdFdPVx5xCAdwD09GEhIJSXJERHAPEHRXSlMU
GxscHHEIBClZCkNDXkNwDxB0V0pVcA8Gdw5UT0kHJ0UWcQgZHB0TdFdXOw5OQkpfXkNbKhUI
cA8Qdw53bGlGSlUcHRobHBkfGUdNVXAPBncOW09AHBgLSXJERHAPEHRXS1AdHxIeGRR2Clkn
RUFbWXcOF3YKRE5XHRgfGxwcGhhFJ0UAcQhCSHEIEilZVnAPBncOSVhBAx47Dhd2CX9xCAQp
WQNNVHVESnJHRxsPD3APEHcOHxN0VwYaUQ9XAAAAAIABwJ0="

   }

   ]

   }

   ]

   }

   {

"token": "Ab2t-
qWttPKq0NGrsfTp97y8q6St0aux9JaCwMXY3eL737qH-ebyoqv4rbTyqYetrezlzvrg-
_nCsvr-rb-
5ubispamVubDu4ubvrbSryJCRhdu2varyoqv9v7zmtazy1K3n7df04pitu7iwvdKrp4r6t_z
q1aq19dWpu7m0y-_96dOss_CK-qfu-tbr4OrVqeyE5rzc1aqj0qvoubSr-
vzVqrXSq7_m6pitotWq6uDu4ri9m-
Hh1aq10qu64uDyvrm51K2i1am7t6r75tWqtdKruuSE5qPSq_Hq7_vX9OKYrby5uLbSq6eK-
qfn7_r75v3W5bmE5rXSq9LJz7q65Oj0v765vLq_u73khOaj0qv-6ubg6Lq9m-
Hh1aq10qu74en2t7u8sdOspdf0tbL80quy06y4vubp8bq-
ubm_vrnX9PSYreft1K201annhOaj0qvs_ef_7or6_tOs2tStotWpsrm90OHv1-Lh5_--
hOa10qu6ttKr9qul5vIAAAAAmkIlUw==",
"name": "Reverse Light/ Parts",

   "code": "1017"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AX1tOmVtdDJqEBFrcTQpN3x8a2RtEWtxNFZCAAUYHSI7H3pHOSYyYms4bXQyaUdtbSwlDjo
gOzkCcjo-
bX95eXhsZWlVeXAuIiYvbXRrCFBRRRt2fWoyYms9f3wmdWwyFG0nLRc0Ilhte3hwfRJrZ0o6
dzwqFWp1NRVpe3l0Cy89KRNsczBKOmcuOhYrICoVaSxEJnwcFWpjEmsoeXRrOjwVanUSa38m
KlhtYhVqKiAuInh9WyEhFWp1Emt6IiAyfnl5FG1iFWl7d2o7JhVqdRJreiREJmMSazEqLzsX
NCJYbXx5eHYSa2dKOmcnLzo7Jj0WJXlEJnUSaxIJD3p6JCg0f355fHp_e30kRCZjEms-
KiYgKHp9WyEhFWp1Emt7ISk2d3t8cRNsZRc0dXI8EmtyE2x4fiYpMXp-
eXl_fnkXNDRYbSctFG10FWknRCZjEmssPSc_Lko6PhNsGhRtYhVpcnl9ECEvFyIhJz9-
RCZ1Emt6dhJrNmtlJjIAAAAA4Pmlsw=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AWV1In11bCpyCAlzaSwxL2Rkc3x1CXNpLE5aGB0ABTojB2JfIT4qenMgdWwqcU9scHVscyQ
lIzRxIiJNIj8yOxAkPiZ-
SXh1bHNhZ2dmcSIiXzYiMDw4MXNpLENaHhcFaGN0LH8sdnUzdGtyLApzOmpcPm0Kc2VmbmMP
LCxAdSUiNAt0ayhSInE2JhUxIzcNcTR7QHU1MCQINT43UiImC3RiAgt0fQ8sY3M7OSQiC3Rr
Dyw0LGUKc3wLdDQ9aWlyMgk_Pwt0aw8sMShvYGBnZwpzf1IicTg4JTgLdGsPLDEuC3R9DHUv
NDJ8XD5tCnNiZ2ZoDywsQHU1OTEkJTggUW5zC3RrDHUMFxI9MS5nZmFgZ2JkYjw2Lgt0fQx1
IDQ7Z2NwMgk_Pwt0aw8sMCtmZGllYm8NcSJcPjogIgx1bA1xPzUsZmNkYGdnYWM-
XD57CnM5MwpzaVIiLQt0fQx1MiM6eGVAdWwNcgQKc39SIng2Lw4_MQk8PGB0dAt0awx1ZGgP
LH1hKnQsAAAAABUVguM="

   }

   ]

   "children": [

   {

"token": "Aam57rG5oOa-xMW_peD946iov7C5xb-
l4IKW1NHMyfbvy66T7fLmtr_suaDmvZO5ufjx2u707-
3Wpu7quautrqu4sb2BraT69vL7uaC_3ISFkc-iqb7mtr_pq6jyobjmwLnz-
cPg9oy5r6ykqca_s57uo-j-wb6h4cG9r62g3_vp_ce4p-
Se7rP67sL_9P7BvfiQ8qjIwb63xr_8raC_7ujBvqHGv6vy_oy5tsG-
_vT69qypj_X1wb6hxr-u9vTmqq2twLm2wb2vo77v8sG-oca_rvCQ8rfGv-X---
_D4PaMuaitrKLGv7Oe7rPz--
7v8unC8a2Q8qHGv8bd266u8Pzgq6qtqK6rr6nwkPK3xr_q_vL0_K6pj_X1wb6hxr-
v9f3io6-opce4scPgoaboxr-
mx7isqvL95a6qra2rqq3D4OCMufP5wLmgwb3zkPK3xr_46fPr-
p7u6se4zsC5tsG9pq2pxPX7w_b18-uqkPKhxr-uosa_4r-x8uYAAAAAyMxYfw==",
"name": "Bulb, reverse light",

   "code": "1020"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",

   "token"

"AXlpPmFpcDZuFBVvdTAtM3h4b2BpFW91MFJGBAEcGSY_G35DPSI2Zm88aXA2bUNpaSghCj4
kPz0Gdj46aXt9fntoYW1RfXQqJiIraXBvDFRVQR9yeW42Zm85e3gicWg2EGkjKRMwJlxpf3x
0eRZvY04-
czguEW5xMRFtf31wDys5LRdodzROPmMqPhIvJC4RbShAIngYEW5nFm8sfXBvPjgRbnEWb3si
LlxpZhFuLiQqJnx5XyUlEW5xFm9-
JiQ2en19EGlmEW1_c24_IhFucRZvfiBAImcWbzUuKz8TMCZcaXh9fHIWb2NOPmMjKz4_IjkS
IX1AInEWbxYNC35-
ICwwe3p9eH57f3kgQCJnFm86LiIkLH55XyUlEW5xFm9_JS0yc394dRdoYRMwcXY4Fm92F2h8
eiItNX56fX17en0TMDBcaSMpEGlwEW0jQCJnFm8oOSM7Kk4-
OhdoHhBpZhFtdn15FCUrEyYlIzt6QCJxFm9-chZvMm9hIjYAAAAADsKFSA=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AVlJHkFJUBZONDVPVRANE1hYT0BJNU9VEHJmJCE8OQYfO15jHQIWRk8cSVAWTXNQTElQTxg
ZHwhNHh5xHgMOBywYAhpCdURJUE9dW1hdTR4eYwoeDAAEDU9VEH9mIis5VF9IEEMQSkkPSFd
OEDZPBlZgAlE2T1laUl8zEBB8SRkeCDdIVxRuHk0KGikNHwsxTQhHfEkJDBg0CQILbh4aN0h
ePjdIQTMQX08HBRgeN0hXMxAIEFk2T0A3SAgBVVVODjUDAzdIVzMQDRRTXFxbWzZPQ24eTQQ
EGQQ3SFczEA0SN0hBMEkTCA5AYAJRNk9eW1pUMxAQfEkJBQ0YGQQcbVJPN0hXMEkwKy4BDRJ
bWl1cW15YXgAKEjdIQTBJHAgHW19MDjUDAzdIVzMQDBdaWFVZXlMxTR5gAgYcHjBJUDFNAwk
QWl9YXFtbXV8CYAJHNk8FDzZPVW4eETdIQTBJDh8GRFl8SVAxTjg2T0NuHkQKEzIDDTUAAFx
ISDdIVzBJWFQzEEFdFkgQAAAAAA3izZc="

   }

   ]

   }

   ]

   }

   {

"name": "Side-/Marker Light/-Parts",

   "children": [

   {

"token": "AbSk86ykvfuj2diiuP3g_rW1oq2k2KK4_Z-
LyczR1Ovy1rOO8O_7q6LxpL37oI6kpOXsx_Pp8vDLu_P3pLaws7OlrKCcsLnn6-
_mpL2iwZmYjNK_tKP7q6L0trXvvKX73aTu5N7965GksrG5tNuiroPzvvXj3KO8_NygsrC9wu

b04NqluvmD867n89_i6ePcoOWN77XV3KOq26LhsL2i8_Xco7zborbv45Gkq9yj4-
nn67G0kujo3KO826Kz6-n7t7Cw3aSr3KCyvqPy79yjvNuis-
2N76rbovjj5vLe_euRpLWwsb_boq6D867u5vPy7_Tf7LCN77zbotvAxrOz7eH9trewtbO2sr
Ttje-q26L34-_p4bO0kujo3KO826Ky6OD_vrK1uNqlrN79vLv126K72qWxt-_g-
LO3sLC2t7De_f2RpO7k3aS93KDuje-
q26Ll9O7254Pz99ql092kq9ygu7C02ejm3uvo7va3je-
826Kzv9ui_6Ks7_sAAAAAhWQJtw==",
"name": "Bulb",

   "code": "1025"

   "links": [

   {

"action": "getGroupParts",
"label": "List quick details",
"token": "Af_vuOfv9rDokpPp87artf7-6ebvk-
nzttTAgoean6C5nfjFu6Sw4Om67_aw68Xv766njLiiubuA8Li87_37-Pju5-vX-
_KsoKSt7_bpitLTx5n0_-iw4Om__f6k9-6wlu-lr5W2oNrv-fry_5Dp5ci49b6ol-j3t5fr-
fv2ia2_q5Hu8bLIuOWsuJSpoqiX667GpP6el-jhkOmq-
_bpuL6X6PeQ6f2kqNrv4JfoqKKsoPr_2aOjl-j3kOn4oKKw_Pv7lu_gl-v59ei5pJfo95Dp-
KbGpOGQ6bOorbmVtqDa7_77-vSQ6eXIuOWlrbi5pL-Up_vGpPeQ6ZCLjfj4pqq2_fz7_vj9-
f-mxqThkOm8qKSiqvj_2aOjl-j3kOn5o6u09fn-85Hu55W29_C-kOnwke76_KSrs_j8-
_v9_PuVtrba76Wvlu_2l-
ulxqThkOmuv6W9rMi4vJHumJbv4Jfr8Pv_kqOtlaCjpb38xqT3kOn49JDptOnnpLAAAAAARZ
I0wA=="

   }

   {

"action": "getGroupPartsAll",
"label": "List quick details including all",
"token": "AYGRxpmRiM6W7O2XjcjVy4CAl5iR7ZeNyKq-
_Pnk4d7H44a7xdrOnpfEkYjOlauIlJGIl8DBx9CVxsapxtvW3_TA2sKarZyRiJeFg4CAlcbG
u9LG1Njc1ZeNyKe--vPhjIeQyJvIkpHXkI-WyO6X3o642onul4GCiofryMikkcHG0O-
Qj8y2xpXSwvHVx9PpldCfpJHR1MDs0drTtsbC75CG5u-
QmevIh5ff3cDG75CP68jQyIHul5jvkNDZjY2W1u3b2--Qj-vI1cyLhISDg-
6Xm7bGldzcwdzvkI_ryNXK75CZ6JHL0NaYuNqJ7peGg4KM68jIpJHR3dXAwdzEtYqX75CP6J
Ho8_bZ1cqDgoWEg4aAhtjSyu-QmeiRxNDfg4eU1u3b2--Qj-vI1M-
CgI2Bhovplca42t7ExuiRiOmV29HIgoeAhIODhYfauNqf7pfd1-6XjbbGye-
QmeiR1sfenIGkkYjpluDul5u2xpzSy-rb1e3Y2ISQkO-Qj-
iRgIzryJmFzpDIAAAAAA0F4YI="

   }

   ]

   }

   ]

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getGroupParts
That allows to get a list of vehicle groups as units with details of the unit only related to this group.
Request body

"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"PartsListByCategoryResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/PartsListByCategoryV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, PartsListByCategoryV2Dto
Example of the previous step
"action": "getGroupParts",
"label": "List quick details",

   "token"

"AcrajdLaw4Xdp6bcxoOegMvL3NPaptzGg9f9rJeurqCpkprkjpGF1dyP2sOF3uDD39rD3Iu
KjJvejY3ijZCdlL-
LkYnR5tfaw9zN2tXcv8Db0pSWmd3C27mx_u2ByMjGz8Hbg9CD2dqc28Tdg6Xcmf2Nic_Oz8f
O1aLe0fORwqXcuLWmvKCDg-
_aj6LdwqXczeab6ajMrazJs6vNlZ6HzsGi3YXbgwAAAAALFqKi"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getGroupParts>: {

   "token"

"AcrajdLaw4Xdp6bcxoOegMvL3NPaptzGg9f9rJeurqCpkprkjpGF1dyP2sOF3uDD39rD3Iu
KjJvejY3ijZCdlL-
LkYnR5tfaw9zN2tXcv8Db0pSWmd3C27mx_u2ByMjGz8Hbg9CD2dqc28Tdg6Xcmf2Nic_Oz8f
O1aLe0fORwqXcuLWmvKCDg-
_aj6LdwqXczeab6ajMrazJs6vNlZ6HzsGi3YXbgwAAAAALFqKi",
"filterValues": [],
"currentFilterState": ""

   }

Response example

   {

"dataType": "PartsListByCategoryResponseV2",

   "data": {

   "categories": [

   {

   "category": {

   "token"

"AdjIn8DI0ZfPtbTO1JGMktnZzsHItM7UkcXvvoW8vLK7gIj2nIOXx86dyNGXzPDc1YuHg4r
I0c6p_uLj2Nvd1drSzpOfn9eDj87XyJCwzNbhg9Dc29zS3cCykc39yNGwz62ms6zvn422yZq
xyNGwzIL6lbC72b652qa7gomQ3t3UsciWzsKR08iOydbPkbfOje-
fm9ja1dnb2Nrazp_cAAAAABlKm9s=",
"name": "6-CYLINDER ENGINE",

   "code": "00"

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"Aef3oP_37qjwiovx666zrebm8f73i_HrrvrQgbqDg42Ev7fJo7yo-PGi9-
6o88_j6rS4vLX37vGWwd3c5-Ti6uXt8aygoOi8sPHo96-P8-nevO_j5OPt4v-NrvLC9-
6P8JKZjJPQoLKJ9qWO9-6P873Fqo-
E5oGG5ZmEvbav4eLrjvep8f2u7Pex9unwrojxstCgpOfl6ubk5-Xl8aDjAAAAAJ7oM8c="

   }

   ]

   }

   "units": [

   {

   "unit": {

"code": "6N00-103",
"name": "ENGINE ASM-3.6L V6 PART 5 OIL PUMP,PAN & RELATED

## PARTS (LGX/3.6S)"

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",

   "token"

"AX1tOmVtdDJqEBFrcTQpN3x8a2RtEWtxNGBKGyAZGRceJS1TOSYyYms4bXQyaVd0aG10ay4
uIjouNDQmHjsgKyQJOyRjaE0rbHNqfWxlaVV5cC4iJi9tdGsMW0dGfX54cH93azY6OnImKmt
ybTUVaXNEJnV5fnl3eGUXNGhYbXQVaggDFglKOigTbD8UbXQVaSdfMBUefBscfwMeJyw1e3h
xFG0za2c0bW0rbHNqNBJrIko6Pnt3e3h6d2UXNGhYbXR-
enp2eH0vLygTbD0UbXQVaUVEJjJsNAAAAACUsNQe"

   }

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"ASMzZDszKmw0Tk81L2p3aSIiNTozTzUvaj4URX5HR0lAe3MNZ3hsPDVmMypsNwkqNjMqNXB
wfGRwamp4QGV-
dXpXZXo9NhN1Mi00IzI7NwsnLnB8eHEzKjVSBRkYIyAmLiEpNWhkZCx4dDUsM2tLNy0aeCsn
ICcpJjtJajYGMypLNFZdSFcUZHZNMmFKMypLN3kBbktAIkVCIV1AeXJrJSYvSjNtNTlqMzN1
Mi00akw1fBRkYCUpJSYkKTtJajYGMyogJCQoJiNxcXZNMmNKMypLNxsaeGwyagAAAAAV53ec

   "

   }

   ]

   "token"

"AURUA1xUTQtTKShSSA0QDkVFUl1UKFJIDVlzIhkgIC4nHBRqAB8LW1IBVE0LUG5NUVRNUhc
XGwMXDQ0fJwIZEh0wAh1aUXQSVUpTRFVcUGxASRcbHxZUTVI1Yn5_REdBSUZOUg8DA0sfE1J
LVAwsUEp9H0xAR0BOQVwuDVFhVE0sUzE6LzBzAxEqVQYtVE0sUB5mCSwnRSIlRjonHhUMQkF
ILVQKUl4NVFQSVUpTDStSG3MDB0JOQkFDTlwuDVFhVE1HQ0NPQUQWFhEqVQQtVE0sUHx9Hwt
VDQAAAAAvUGrA",
"imageNames": [

   "
<https://img.altechopersys.com/GM_B201809/%size%/492059.gif>?
s=1332&k=330ef709038288e11c30b527672781b6"

   ]

   }

"partSections": [

   {

"title": "ENGINE ASM-3.6L V6 PART 5 OIL PUMP,PAN &

## RELATED PARTS (LGX/3.6S)"

   "parts": [

   {

"partNumber": "19330000",
"partName": "FILTER",

   "qty": {

   "note": "01"

   }

"partNumberFormatted": "19330000",
"displayName": "FILTER,OIL(PART OF 18)(ACDelco

## #PF63E)"

   "attributes": [

   {

   "code": "usage"

   "label": "usage"

   "values": [

   "ZB,ZC,ZD79(LGX,M3G)(EXC KPS)"

   ]

   "type": "simple"

   }

   {

"code": "GROUP",
"label": "Group",

   "values": [

   "01.836"

   ]

   "type": "simple"

   }

   {

"code": "YEAR_RANGE",
"label": "Year",

   "values": [

   "2018 - 2018"

   ]

   "type": "simple"

   }

   ]

"areaCode": "25",
"matched": true

   }

   ]

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getGroupPartsAll
That allows to get a list of vehicle groups as units with all details of the unit and details of the group are noted with .matched=true
Request body
"FilterDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"PartsListByCategoryResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/PartsListByCategoryV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, PartsListByCategoryV2Dto
Example of the previous step
"action": "getGroupPartsAll",
"label": "List quick details including all",

   "token"

"AcrajdLaw4Xdp6bcxoOegMvL3NPaptzGg9f9rJeurqCpkprkjpGF1dyP2sOF3uDD39rD3Iu
KjJvejY3ijZCdlL-
LkYnR5tfaw9zN2tXcv8Db0pSWmd3C27mx_u2ByMjGz8Hbg9CD2dqc28Tdg6Xcmf2Nic_Oz8f
O1aLe0fORwqXcuLWmvKCDg-
_aj6LdwqXczeab6ajMrazJs6vNlZ6HzsGi3YXbgwAAAAALFqKi"
Request example
POST: <https://oem-api.yqservice.eu/restApi/v2/getGroupPartsAll>: {

   "token"

"AcrajdLaw4Xdp6bcxoOegMvL3NPaptzGg9f9rJeurqCpkprkjpGF1dyP2sOF3uDD39rD3Iu
KjJvejY3ijZCdlL-
LkYnR5tfaw9zN2tXcv8Db0pSWmd3C27mx_u2ByMjGz8Hbg9CD2dqc28Tdg6Xcmf2Nic_Oz8f
O1aLe0fORwqXcuLWmvKCDg-
_aj6LdwqXczeab6ajMrazJs6vNlZ6HzsGi3YXbgwAAAAALFqKi",
"filterValues": [],
"currentFilterState": ""

   }

Response example

   {

"dataType": "PartsListByCategoryResponseV2",

   "data": {

   "categories": [

   {

   "category": {

   "token"

"AS8_aDc_JmA4QkM5I2Z7ZS4uOTY_QzkjZjIYSXJLS0VMd38Ba3RgMDlqPyZgOwcrInxwdH0
_JjleCRUULywqIi0lOWRoaCB0eDkgP2dHOyEWdCcrLCslKjdFZjoKPyZHOFpRRFsYaHpBPm1
GPyZHO3UNYkdMLklOLVFMdX5nKSojRj9hOTVmJD95PiE4ZkA5ehhobC8tIi4sLy0tOWgrAAA
AAJdljwo=",
"name": "6-CYLINDER ENGINE",

   "code": "00"

   "links": [

   {

"action": "getUnits",
"label": "List units",

   "token"

"AW9_KHd_ZiB4AgN5YyY7JW5ueXZ_A3ljJnJYCTILCwUMNz9BKzQgcHkqf2Yge0drYjwwND1
_ZnkeSVVUb2xqYm1leSQoKGA0OHlgfycHe2FWNGdrbGtlancFJnpKf2YHeBoRBBtYKDoBfi0
Gf2YHezVNIgcMbgkObREMNT4naWpjBn8heXUmZH85fmF4JgB5OlgoLG9tYm5sb21teShrAAA

AACu4hmo="

   }

   ]

   }

   "units": [

   {

   "unit": {

"code": "6N00-103",
"name": "ENGINE ASM-3.6L V6 PART 5 OIL PUMP,PAN & RELATED PARTS (LGX/3.6S)"

   "links": [

   {

"action": "getUnitInfo",
"label": "Unit info",
"token": "Aam57rG5oOa-xMW_peD946iov7C5xb-
l4LSez_TNzcPK8fmH7fLmtr_suaDmvYOgvLmgv-jp7_i97u6B7vP-99zo8uqyhbS5oL-
uuba_3KO4sff1-r6huNrSnY7iq6ulrKK44LPgurn_uKe-4Ma_-
p7u6qytrKSttsG9spDyoca_29bF38Pg4Iy57MG-oca_roX4isuvzs-
q0Miu9v3kraLBvua4sb23pbS5oL_nx7j0w-
D25KKoramitsG9spDyoa2vqaOrq6b14Iy57sG-oca_zJ7urbnnAAAAADUmkNM="

   }

   {

"action": "getUnitParts",
"label": "Parts",

   "token"

"AS8_aDc_JmA4QkM5I2Z7ZS4uOTY_QzkjZjIYSXJLS0VMd38Ba3RgMDlqPyZgOwUmOj8mOW5
vaX47aGgHaHV4cVpudGw0AzI_JjkoPzA5WiU-N3FzfDgnPlxUGwhkLS0jKiQ-
ZjVmPD95PiE4ZkA5fBhobCorKiIrMEc7NBZ0J0A5XVBDWUVmZgo_akc4J0A5KAN-
DE0pSEksVk4ocHtiKyRHOGA-
NzsxIzI_JjlhQT5yRWZwYiQuKy8kMEc7NBZ0JyspLyUtLSBzZgo_aEc4J0A5ShhoKz9hAAAA
AEcpgRw="

   }

   ]

   "token"

"AcPThNvTyozUrq_Vz4qXicLC1drTr9XPit70pZ6np6mgm5Pth5iM3NWG08qM1-
nK1tPK1YKDhZLXhITrhJmUnbaCmIDY797TytXE09zVtsnS252fkNTL0rC49-
SIwcHPxsjSitmK0NOV0s3UiqzVkPSEgMbHxs7H3KvX2PqYy6zVsbyvtamKiubThqvUy6zVxO
S4KHFpKXAuqLEnJeOx8ir1IzS29fdz97TytWNrdKeqYqcjsjCx8PI3KvX2PqYy8fFw8nBwcy
fiubThKvUy6zVpvSEx9ONAAAAAG3okLw=",
"imageNames": [

   "
<https://img.altechopersys.com/GM_B201809/%size%/492059.gif>?
s=1332&k=330ef709038288e11c30b527672781b6"

   ]

   }

"partSections": [

   {

"title": "ENGINE ASM-3.6L V6 PART 5 OIL PUMP,PAN & RELATED PARTS (LGX/3.6S)"

   "parts": [

   {

"partNumber": "12672634",
"partName": "TUBE",

   "qty": {

   "note": "01"

   }

"partNumberFormatted": "12672634",

"displayName": "TUBE,OIL LVL IND(INCLS 3)",

   "attributes": [

   {

   "code": "usage"

   "label": "usage"

   "values": [

   "ZB,ZC,ZD79(LGX,M3G)(EXC KPS)"

   ]

   "type": "simple"

   }

   {

"code": "GROUP",
"label": "Group",

   "values": [

   "01.516"

   ]

   "type": "simple"

   }

   {

"code": "YEAR_RANGE",
"label": "Year",

   "values": [

   "2018 - 2018"

   ]

   "type": "simple"

   }

   ]

"areaCode": "1"

   }

   {

"partNumber": "12637179",
"partName": "GASKET",

   "qty": {

   "note": "01"

   }

"partNumberFormatted": "12637179",
"displayName": "GASKET,O/PMP SUC PIPE(PART OF 46)",

   "attributes": [

   {

   "code": "usage"

   "label": "usage"

   "values": [

   "ZB,ZC,ZD79(LGX,M3G)(EXC KPS)"

   ]

   "type": "simple"

   }

   {

"code": "GROUP",
"label": "Group",

   "values": [

   "01.656"

   ]

   "type": "simple"

   }

   {

"code": "YEAR_RANGE",

"label": "Year",

   "values": [

   "2018 - 2018"

   ]

   "type": "simple"

   }

   ]

"areaCode": "48"

   }

   ]

   }

   ]

   }

   ]

   }

   ]

   }

   }

POST /restApi/v2/getPartApplicability
This function allows to find out in which part of the car the detail is used.
Request body
"FilterStatefullFormDataRequestV2": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

"formValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"filterValues": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormValueV2"

   }

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: FormValueV2
Response schema
"PartsListByCategoryResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/PartsListByCategoryV2Dto"

   }

"currentFilterState": {

   "type": "string"

   }

   }

   }

see also: ErrorDtoV2, PartsListByCategoryV2Dto
Example of the previous step
"action" : "getPartApplicability",
"label" : "Part applicability",
"operationName" : "GETPARTAPPLICABILITY_V2",
"token" : "Aa6-6ba-p-G5w8K4ouf65K-vuLe-wrii56S20_LZ8qzw6K-
c6vXhsbjrvqfhuoaqo_3x9fy-p7jbg4KWyKWuueGxuO6sr_Wmv-HHvvT-
xOfxi76oq6Ouwbi0memk7_nGuabmxrqoqqfY_O76wL-g45nptP3pxfjz-
ca6_5f1r8_GueHg57q4AAAAAMiHIm0=",

   "fields" : [ {

   "type" : "input"

"name" : "PartNumber",
"label" : "Part number",
"required" : true

   }, {

   "type" : "select"

"name" : "IncludeReplacements",
"label" : "Include replacements",

   "options" : [ {

   "value" : "true"

"label" : "Yes"

   }, {

   "value" : "false"

"label" : "No"

   } ]

   } ]

Request example
POST: /restApi/v2/getPartApplicability: {
"token": "Aa6-6ba-p-G5w8K4ouf65K-vuLe-wrii56S20_LZ8qzw6K-
c6vXhsbjrvqfhuoaqo_3x9fy-p7jbg4KWyKWuueGxuO6sr_Wmv-HHvvT-
xOfxi76oq6Ouwbi0memk7_nGuabmxrqoqqfY_O76wL-g45nptP3pxfjz-
ca6_5f1r8_GueHg57q4AAAAAMiHIm0=",
"formValues": [

   {

"name": "PartNumber",

   "value": "71751448"

   }

   {

"name": "IncludeReplacements",

   "value": "true"

   }

   ]

"currentFilterState": ""

   }

Response example

   {

"dataType" : "PartsListByCategoryResponseV2",

   "data" : {

   "categories" : [ {

   "category" : {

"name" : "10000. ENGINE"

   }

   "units" : [ {

   "unit" : {

   "code" : "10000/00"

"name" : "ENGINE (Var.: 1/Rev.: 0)",

   "links" : [ {

"action" : "getUnitInfo",
"label" : "Unit info",

   "token"

"AdDAl8jA2Z_HvbzG3JmEmtHRxsnAvMbcmdrIrYynjNKOltHilIufz8aVwNmfxPjU3YOPi4L
A2cal_fzottvQx5_PxpDS0YvYwZ-
5wIqAupmP9cDW1d3Qv8bK55fakYe4x9iYuMTW1NmmgpCEvsHeneeXyoOXu4aNh7jEgemL0bG
4x5-emcSXl9yLh8bfwJi4xNLR9cDZuMfW0dTSjumLzr_GlpGHuMSBzvXAjoWVpoKQh-
eXk5m_xoaDl7uF1NH1wNm4x9GxuMSX6YuBj42Gioa4xIHpi9K_xsm-
wZeBycX2gYyAucDZuMSL6YvOv8aTg5GNh9XBzL7B3rnA0rjEl-
mLkIaSjJGKi4je6YvYv8bVvsHIupnAx4uXrYG-
wd66mYGb0tfRucDPuMTI0tq9gIuBvsHeupmF9cDPuMeWgoaK3vbGhoa4x9i_xteLhZnSzNTV
vsHIupnS25K8h4qGv8bc55eY0tO4x5-emcTGAAAAAPVWd3k="

   }, {

"action" : "getUnitParts",
"label" : "Parts",

   "token"

"AeT0o_z07avziYjy6K2wruXl8v30iPLore78mbiTuOa6ouXWoL-r-
_Kh9O2r8Mzg6be7v7b07fKRycjcgu_k86v78qTm5b_s9auN9L60jq27wfTi4enki_L-
06PupbOM8-ysjPDi4O2StqSwivXqqdOj_rejj7K5s4zwtd2_5YWM86uqrfCjo-
i_s_Lr9KyM8OblwfTtjPPi5eDmut2_-ovyoqWzjPC1-sH0urGhkraks9Ojp62L8rK3o4-
x4OXB9O2M8-WFjPCj3b-1u7myvrKM8LXdv-
aL8v2K9aO1_fHCtbi0jfTtjPC_3b_6i_Knt6W5s-H1-Ir16o305ozwo92_pLKmuKW-
v7zq3b_si_LhivX8jq3087-jmbWK9eqOrbWv5uPljfT7jPD85u6JtL-
1ivXqjq2xwfT7jPOitrK-6sLysrKM8-yL8uO_sa3m-
ODhivX8jq3m76aIs76yi_Lo06Os5ueM86uqrfDyAAAAADrBdNc="

   } ]

"token" : "Ad3NmsXN1JLKsLHL0ZSJl9zcy8TNscvRlNfFoIGqgd-
Dm9zvmYaSwsuYzdSSyfXZ0I6Cho_N1Muo8PHlu9bdypLCy53f3IbVzJK0zYeNt5SC-
M3b2NDdssvH6prXnIq1ytWVtcnb2dSrj52Js8zTkOqax46atouAirXJjOSG3Ly1ypKTlMmam
tGGisvSzZW1yd_c-M3Utcrb3Nnfg-SGw7LLm5yKtcmMw_jNg4iYq4-
diuqanpSyy4uOmraI2dz4zdS1yty8tcma5IaMgoCLh4u1yYzkht-
yy8SzzJqMxMj7jIGNtM3UtcmG5IbDssuejpyAitjMwbPM07TN37XJmuSGnYufgZyHhoXT5Ib
VssvYs8zFt5TNyoaaoIyzzNO3lIyW39rctM3CtcnF39ewjYaMs8zTt5SI-
M3Ctcqbj4uH0_vLi4u1ytWyy9qGiJTfwdnYs8zFt5Tf1p-
xioeLssvR6pqV3961ypKTlMnLAAAAACsLNLI=",

"imageNames" : [ "
https://img.altechopersys.com/CFIAT84/%size%/97

## /97976a4374afad6a477684c9ecf5dc66.gif?

s=1332&k=e483c5961fcc18700e8e7773ed50d448" ]

   }

"partSections" : [ {

   "parts" : [ {

"partNumber" : "71751448",
"partName" : "UNCOMPLETE-ENGINE",
"partNumberFormatted" : "71751448",
"displayName" : "UNCOMPLETE-ENGINE",

   "attributes" : [ {

   "code" : "amount"

"label" : "Quantity",

   "values" : [ "01" ]

   "type" : "simple"

   }, {

"code" : "measurementUnit",
"label" : "measurementUnit",
"values" : [ "Num" ],

   "type" : "simple"

   }, {

   "code" : "macrofamily"

   "label" : "macrofamily"

"values" : [ "B" ],

   "type" : "simple"

   }, {

   "code" : "family"

   "label" : "family"

"values" : [ "AA03" ],

   "type" : "simple"

   }, {

"code" : "familyName",
"label" : "familyName",
"values" : [ "SEMICOMPLETE ENGINE" ],

   "type" : "simple"

   }, {

   "code" : "pattern"

   "label" : "pattern"

"values" : [ "(KW99)", "KW99 - POWER: 1.4" ],

   "type" : "simple"

   }, {

   "code" : "weigth"

   "label" : "weigth"

   "values" : [ "83000" ]

   "type" : "simple"

   } ]

"areaCode" : "1",
"matched" : true

   }, {

"partNumber" : "71769502",
"partName" : "UNCOMPLETE-ENGINE",
"partNumberFormatted" : "71769502",
"displayName" : "UNCOMPLETE-ENGINE",

   "attributes" : [ {

   "code" : "amount"

"label" : "Quantity",

   "values" : [ "1" ]

   "type" : "simple"

   }, {

"code" : "measurementUnit",
"label" : "measurementUnit",
"values" : [ "Num" ],

   "type" : "simple"

   }, {

   "code" : "macrofamily"

   "label" : "macrofamily"

"values" : [ "B" ],

   "type" : "simple"

   }, {

   "code" : "family"

   "label" : "family"

"values" : [ "AA03" ],

   "type" : "simple"

   }, {

"code" : "familyName",
"label" : "familyName",
"values" : [ "SEMICOMPLETE ENGINE" ],

   "type" : "simple"

   }, {

   "code" : "pattern"

   "label" : "pattern"

"values" : [ "(KW132)", "KW132 - POWER: 1.4  180 HP" ],

   "type" : "simple"

   }, {

   "code" : "weigth"

   "label" : "weigth"

   "values" : [ "83000" ]

   "type" : "simple"

   } ]

"areaCode" : "1"

   } ]

   } ]

   } ]

   } ]

   }

   }

## OEM REST API schemas

Below you can see documentation for the OEM REST API schemas.
AttrNodeV2
"AttrNodeV2": {

   "type": "object"

   "properties": {

   "code": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "values": {

   "type": "array"

   "items": {

   "type": "string"

   }

   }

   "children": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

   "type": {

   "type": "string"

   "enum": [

   "simple"

"simpleValue",

   "composite"

   "group"

   ]

   }

   }

   }

BaseSysProperty
"BaseSysProperty": {

   "type": "object"

   "properties": {

   "code": {

   "type": "string"

   }

   "value": {

   "type": "object"

   }

   }

   }

CatalogInfoResponseV2
"CatalogInfoResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CatalogInfoV2Dto"

   }

   }

   }

see also: ErrorDtoV2, CatalogInfoV2Dto
CatalogInfoV2Dto
"CatalogInfoV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "brand": {

   "type": "string"

   }

   "archived": {

   "type": "boolean"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "forms": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormV2Dto"

   }

   }

   }

   }

see also: LinkV2Dto, FormV2Dto
CatalogListV2Dto
"CatalogListV2Dto": {

   "type": "object"

   "properties": {

   "catalogs": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/CatalogV2Dto"

   }

   }

   "forms": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormV2Dto"

   }

   }

   }

   }

see also: CatalogV2Dto, FormV2Dto
CatalogShortResponseV2
"CatalogShortResponseV2": {

   "type": "object"

   "properties": {

   "error": {

"$ref": "#/components/schemas/ErrorDtoV2"

   }

   "data": {

"$ref": "#/components/schemas/CatalogShortV2Dto"

   }

   }

   }

see also: ErrorDtoV2, CatalogShortV2Dto
CatalogShortV2Dto
"CatalogShortV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "brand": {

   "type": "string"

   }

   "archived": {

   "type": "boolean"

   }

   }

   }

CatalogV2Dto
"CatalogV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "brand": {

   "type": "string"

   }

   "archived": {

   "type": "boolean"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   }

   }

see also: LinkV2Dto
CategoryNodeV2Dto
"CategoryNodeV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "code": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "children": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/CategoryNodeV2Dto"

   }

   }

   }

   }

see also: LinkV2Dto, CategoryNodeV2Dto
CategoryShortV2Dto
"CategoryShortV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "code": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   }

   }

see also: LinkV2Dto
CheckboxV2
"CheckboxV2": {

   "type": "object"

"allOf": [

   {

"$ref": "#/components/schemas/FieldV2"

   }

   ]

   }

see also: FieldV2
CustomerDto
"CustomerDto": {

   "type": "object"

   "properties": {

   "login": {

   "type": "string"

   }

   }

   }

ErrorDtoV2
"ErrorDtoV2": {

   "type": "object"

   "properties": {

   "message": {

   "type": "string"

   }

"requestId": {

   "type": "string"

   }

   }

   }

ExampleValueV2
"ExampleValueV2": {

   "type": "object"

   "properties": {

   "description": {

   "type": "string"

   }

   "value": {

   "type": "string"

   }

   }

   }

FieldV2
"FieldV2": {

   "required": [

   "type"

   ]

   "type": "object"

   "properties": {

   "name": {

   "type": "string"

   }

   "value": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "readonly": {

   "type": "boolean"

   }

   "required": {

   "type": "boolean"

   }

   "type": {

   "type": "string"

   }

   }

   "discriminator": {

"propertyName": "type"

   }

   }

FormV2Dto
"FormV2Dto": {

   "type": "object"

   "properties": {

   "action": {

   "type": "string"

   }

"updateFormAction": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

"operationName": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "token": {

   "type": "string"

   }

   "fields": {

   "type": "array"

   "items": {

"oneOf": [

   {

"$ref": "#/components/schemas/CheckboxV2"

   }

   {

"$ref": "#/components/schemas/InputFieldV2"

   }

   {

"$ref": "#/components/schemas/SelectV2"

   }

   ]

   }

   }

   }

   }

see also: CheckboxV2, , InputFieldV2SelectV2
FormValueV2
"FormValueV2": {

   "type": "object"

   "properties": {

   "name": {

   "type": "string"

   }

   "value": {

   "type": "string"

   }

   }

   }

GroupNodeV2Dto
"GroupNodeV2Dto": {

   "type": "object"

   "properties": {

   "token": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "code": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "children": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/CategoryNodeV2Dto"

   }

   }

   "synonyms": {

   "type": "string"

   }

   "contains": {

   "type": "string"

   }

   }

   }

see also: LinkV2Dto, CategoryNodeV2Dto
ImageMapAreaV2Dto
"ImageMapAreaV2Dto": {

   "type": "object"

   "properties": {

   "x1": {

   "type": "integer"

   "format": "int32"

   }

   "y1": {

   "type": "integer"

   "format": "int32"

   }

   "x2": {

   "type": "integer"

   "format": "int32"

   }

   "y2": {

   "type": "integer"

   "format": "int32"

   }

"areaCode": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   }

   }

see also: LinkV2Dto
ImageMapV2Dto
"ImageMapV2Dto": {

   "type": "object"

   "properties": {

"imageName": {

   "type": "string"

   }

   "areas": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/ImageMapAreaV2Dto"

   }

   }

   }

   }

see also: ImageMapAreaV2Dto
InputFieldV2
"InputFieldV2": {

   "type": "object"

"allOf": [

   {

"$ref": "#/components/schemas/FieldV2"

   }

   {

   "type": "object"

   "properties": {

   "pattern": {

   "type": "string"

   }

   "examples": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/ExampleValueV2"

   }

   }

   }

   }

   ]

   }

see also: FieldV2, ExampleValueV2
LinkV2Dto
"LinkV2Dto": {

   "type": "object"

   "properties": {

   "action": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

   "token": {

   "type": "string"

   }

   }

   }

MeasuredValue
"MeasuredValue": {

   "type": "object"

   "properties": {

   "value": {

   "type": "number"

   }

   "units": {

   "type": "string"

   }

   "note": {

   "type": "string"

   }

   }

   }

NavigationLinkV2Dto
"NavigationLinkV2Dto": {

   "type": "object"

   "properties": {

   "action": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

   "token": {

   "type": "string"

   }

   "code": {

   "type": "string"

   }

   }

   }

OptionV2
"OptionV2": {

   "type": "object"

   "properties": {

   "value": {

   "type": "string"

   }

   "label": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "selected": {

   "type": "boolean"

   }

   }

   }

PartReferencesListV2Dto
"PartReferencesListV2Dto": {

   "type": "object"

   "properties": {

"partReferences": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartReferencesV2Dto"

   }

   }

   }

   }

see also: PartReferencesV2Dto
PartReferencesV2Dto
"PartReferencesV2Dto": {

   "type": "object"

   "properties": {

"partNumber": {

   "type": "string"

   }

"partName": {

   "type": "string"

   }

   "catalogs": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/CatalogV2Dto"

   }

   }

   }

   }

see also: CatalogV2Dto

PartsByCategoryV2Dto
"PartsByCategoryV2Dto": {

   "type": "object"

   "properties": {

   "category": {

"$ref": "#/components/schemas/CategoryShortV2Dto"

   }

   "units": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartsByUnitV2Dto"

   }

   }

   }

   }

see also: , CategoryShortV2DtoPartsByUnitV2Dto
PartsByUnitV2Dto

   "": {

   "type": "object"

   "properties": {

   "unit": {

"$ref": "#/components/schemas/UnitShortV2Dto"

   }

"partSections": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartSectionV2Dto"

   }

   }

   }

   }

see also: UnitShortV2Dto, PartSectionV2Dto
PartSectionsListV2Dto
"PartSectionsListV2Dto": {

   "type": "object"

   "properties": {

"partSections": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartSectionV2Dto"

   }

   }

   }

   }

see also: PartSectionV2Dto
PartSectionV2Dto
"PartSectionV2Dto": {

   "type": "object"

   "properties": {

   "title": {

   "type": "string"

   }

   "parts": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartV2Dto"

   }

   }

   }

   }

see also: PartV2Dto
PartsByUnitV2Dto

   "": {

   "type": "object"

   "properties": {

   "unit": {

"$ref": "#/components/schemas/UnitShortV2Dto"

   }

"partSections": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartSectionV2Dto"

   }

   }

   }

   }

see also: UnitShortV2Dto, PartSectionV2Dto
PartShortListV2Dto
"PartShortListV2Dto": {

   "type": "object"

   "properties": {

   "brand": {

   "type": "string"

   }

   "parts": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartShortV2"

   }

   }

   }

   }

see also: PartShortV2
PartShortV2
"PartShortV2": {

   "type": "object"

   "properties": {

"partNumber": {

   "type": "string"

   }

"partName": {

   "type": "string"

   }

   }

   }

PartsListByCategoryV2Dto
"PartsListByCategoryV2Dto": {

   "type": "object"

   "properties": {

   "categories": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/PartsByCategoryV2Dto"

   }

   }

   "filter": {

"$ref": "#/components/schemas/FormV2Dto"

   }

   }

   }

see also: PartsByCategoryV2Dto, FormV2Dto
PartV2Dto
"PartV2Dto": {

   "type": "object"

   "properties": {

"partNumber": {

   "type": "string"

   }

"partName": {

   "type": "string"

   }

   "qty": {

"$ref": "#/components/schemas/MeasuredValue"

   }

"partNumberFormatted": {

   "type": "string"

   }

"displayName": {

   "type": "string"

   }

   "attributes": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

"areaCode": {

   "type": "string"

   }

   "refs": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "related": {

"$ref": "#/components/schemas/PartSectionV2Dto"

   }

   "matched": {

   "type": "boolean"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   }

   }

see also: MeasuredValue, AttrNodeV2, LinkV2Dto, PartSectionV2Dto
SelectV2
"SelectV2": {

   "type": "object"

"allOf": [

   {

"$ref": "#/components/schemas/FieldV2"

   }

   {

   "type": "object"

   "properties": {

   "options": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/OptionV2"

   }

   }

   "multiple": {

   "type": "boolean"

   }

   }

   }

   ]

   }

see also: FieldV2, OptionV2
VehicleShortV2Dto
"VehicleShortV2Dto": {

   "type": "object"

   "properties": {

"navigationLinks": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/NavigationLinkV2Dto"

   }

   }

   "type": {

   "type": "string"

   "enum": [

   "UNDEFINED"

   "PASSENGER"

   "COMMERCIAL"

   "MOTO"

   ]

   }

   "brand": {

   "type": "string"

   }

   "model": {

   "type": "string"

   }

   "attributes": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

"sysProperties": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/BaseSysProperty"

   }

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "token": {

   "type": "string"

   }

   }

   }

see also: , , , NavigationLinkV2DtoAttrNodeV2BaseSysPropertyLinkV2Dto
VehicleListV2Dto
"VehicleListV2Dto": {

   "type": "object"

   "properties": {

   "vehicles": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/VehicleShortV2Dto"

   }

   }

   }

   }

see also: VehicleShortV2Dto
VehicleV2Dto
"VehicleV2Dto": {

   "type": "object"

   "properties": {

"navigationLinks": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/NavigationLinkV2Dto"

   }

   }

   "type": {

   "type": "string"

   "enum": [

   "UNDEFINED"

   "PASSENGER"

   "COMMERCIAL"

   "MOTO"

   ]

   }

   "brand": {

   "type": "string"

   }

   "model": {

   "type": "string"

   }

   "attributes": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

"sysProperties": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/BaseSysProperty"

   }

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "token": {

   "type": "string"

   }

   "forms": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/FormV2Dto"

   }

   }

   }

   }

see also: , , , NavigationLinkV2DtoAttrNodeV2BaseSysPropertyLinkV2Dto, FormV2Dto
UnitShortListV2Dto
"UnitShortListV2Dto": {

   "type": "object"

   "properties": {

   "units": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/UnitShortV2Dto"

   }

   }

   }

   }

see also: UnitShortV2Dto
UnitShortV2Dto
"UnitShortV2Dto": {

   "type": "object"

   "properties": {

   "code": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "token": {

   "type": "string"

   }

"imageNames": {

   "type": "array"

   "items": {

   "type": "string"

   }

   "attributes": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

   }

   }

see also: LinkV2Dto, AttrNodeV2
UnitV2Dto
"UnitV2Dto": {

   "type": "object"

   "properties": {

   "code": {

   "type": "string"

   }

   "name": {

   "type": "string"

   }

   "description": {

   "type": "string"

   }

   "links": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/LinkV2Dto"

   }

   }

   "token": {

   "type": "string"

   }

"imageMaps": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/ImageMapV2Dto"

   }

   }

   "attributes": {

   "type": "array"

   "items": {

"$ref": "#/components/schemas/AttrNodeV2"

   }

   }

   }

   }

see also: , , LinkV2DtoImageMapV2DtoAttrNodeV2

## OEM Errors

Below you can find errors that can occur while working with the service.
messagehttp statusdescription
Access denied403Access to the catalog or function is denied.
Access limited403User has the Restricted status that allows
him after his subscription was expired to
access vehicles which were requested in
the past 24 hours and tries to access a
new (previously not requested for the past
24 hours) vehicle.
Invalid parameter409Incorrect parameter value was stated in
the form and passed in the request to the
web service.
Invalid token409Token that is stated in the link is invalid, a
request with this token cannot be
performed.
Not supported409Function is not supported by the catalog.
Server error500Unexpected server error leading to a
breakdown.
Temporary unavailable503Operation is temporarily unable for
performing.
Timeout409Occurs at the end of a predetermined
period of waiting for response.
Too many requests429

Limit of requests sent per minute has been
exceeded.
Too many results to return403Too many results were found by the
request. Usually this error occurs in the
case when an OEM is requested in the
FINDAPPLICABLEVEHICLES and
FINDPARTREFERENCES functions if the
part is marked as Standard Part.
