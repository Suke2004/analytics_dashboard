# Data App

This directory contains the dataset and seed scripts for the Analytics Dashboard.

## Contents

- `Analytics_Test_Data.json` - Test dataset containing invoice data in JSON format

## Usage

The seed script is located in `apps/api/scripts/seed.ts` and processes this JSON file to populate the database.

### Running the Seed Script

```bash
cd apps/api
pnpm prisma:seed
```

### Data Format

The JSON file contains an array of invoice objects with the following structure:

```json
{
  "extractedData": {
    "llmData": {
      "invoice": {
        "value": {
          "invoiceId": { "value": "1234" },
          "invoiceDate": { "value": "2025-11-04" }
        }
      },
      "vendor": {
        "value": {
          "vendorName": { "value": "Vendor Name" }
        }
      },
      "customer": {
        "value": {
          "customerName": { "value": "Customer Name" }
        }
      },
      "lineItems": {
        "value": [
          {
            "description": { "value": "Item description" },
            "category": { "value": "Category" },
            "amount": { "value": 100.0 }
          }
        ]
      },
      "payment": {
        "value": {
          "paidDate": { "value": "2025-11-05" },
          "amount": { "value": 100.0 }
        }
      }
    }
  }
}
```

## Notes

- The seed script will clear existing data before seeding
- Vendor and customer records are deduplicated by name
- Invoice amounts are calculated from line items
- Payments are created if payment data is available
