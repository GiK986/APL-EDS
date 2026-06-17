# Catalog Logos

This directory contains brand logos for automotive catalogs.

## File Naming Convention

Logo files should be named using the following pattern:
- **Format**: `{BRAND_NAME}.png`
- **Brand names**: Uppercase, spaces and hyphens replaced with underscores
- **Example**: `BMW.png`, `MERCEDES_BENZ.png`, `LAND_ROVER.png`

## Required Brand Logos

Based on the YQService catalog response, you should add logos for these brands:

- `ABARTH.png`
- `ALFA_ROMEO.png` 
- `AUDI.png`
- `BMW.png`
- `BMW_MOTORRAD.png`
- `BUICK.png`
- `CADILLAC.png`
- `CHEVROLET.png`
- `CHRYSLER.png`
- `CITROEN.png`
- `DACIA.png`
- `DAEWOO.png`
- `DODGE.png`
- `DS.png` (for DS Automobiles)
- `FIAT.png`
- `FIAT_PROFESSIONAL.png`
- `FORD.png`
- `GMC.png`
- `HOLDEN.png`
- `HONDA.png`
- `HUMMER.png`
- `HYUNDAI.png`
- `INFINITI.png`
- `ISUZU.png`
- `JAGUAR.png`
- `JEEP.png`
- `KIA.png`
- `LANCIA.png`
- `LAND_ROVER.png`
- `LEXUS.png`
- `MAZDA.png`
- `MERCEDES_BENZ.png`
- `MINI.png`
- `MITSUBISHI.png`
- `NISSAN.png`
- `OLDSMOBILE.png`
- `OPEL.png`
- `PEUGEOT.png`
- `PONTIAC.png`
- `PORSCHE.png`
- `RAM.png`
- `RAVON.png`
- `RENAULT.png`
- `ROLLS_ROYCE.png`
- `SAAB.png`
- `SATURN.png`
- `SEAT.png`
- `SKODA.png`
- `SMART.png`
- `SSANGYONG.png`
- `SUBARU.png`
- `SUZUKI.png`
- `TOYOTA.png`
- `VAUXHALL.png`
- `VOLKSWAGEN.png`
- `VOLVO.png`

## Image Requirements

- **Format**: PNG preferred (transparent background)
- **Size**: Recommended 64x64px or 128x128px
- **Background**: Transparent preferred
- **Quality**: High resolution for crisp display

## Fallback

If a logo is not found or fails to load, the component will fallback to a generic category icon.

## Usage

The logos are automatically loaded by the `CatalogCard` component based on the catalog's brand name.

```typescript
// The component automatically handles logo loading:
<CatalogCard catalog={catalog} />

// Utility functions are also available:
import { getCatalogLogoPath, getNormalizedBrand } from '@gik986/yq-service-react-ui'

const logoPath = getCatalogLogoPath('BMW') // Returns '/catalog-logos/BMW.png'
const normalized = getNormalizedBrand('Mercedes-Benz') // Returns 'MERCEDES_BENZ'
```