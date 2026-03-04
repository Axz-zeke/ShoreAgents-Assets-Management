// Auto-generated field analysis from imported data
// Generated on 2025-09-26T01:50:44.344Z

export interface FieldMapping {
  default: string
  imported: string
}

export interface ImportedFieldsAnalysis {
  matchedFields: FieldMapping[]
  unmatchedDefaultFields: string[]
  unmatchedImportedFields: string[]
  totalImportedFields: number
}

export const IMPORTED_FIELDS_ANALYSIS: ImportedFieldsAnalysis = {
  "matchedFields": [
    {
      "default": "serialNumber",
      "imported": "serialNumber"
    },
    {
      "default": "assetTagId",
      "imported": "id"
    },
    {
      "default": "description",
      "imported": "description"
    },
    {
      "default": "purchaseDate",
      "imported": "purchaseDate"
    },
    {
      "default": "cost",
      "imported": "value"
    },
    {
      "default": "brand",
      "imported": "brand"
    },
    {
      "default": "model",
      "imported": "model"
    },
    {
      "default": "image",
      "imported": "image"
    }
  ],
  "unmatchedDefaultFields": [
    "purchasedFrom"
  ],
  "unmatchedImportedFields": [
    "name",
    "category",
    "subCategory",
    "location",
    "site",
    "status",
    "dateAcquired",
    "assignedTo",
    "department",
    "notes",
    "additionalInformation",
    "auditedApril2021",
    "assetType",
    "depreciableAsset",
    "salvageValue",
    "depreciationMethod"
  ],
  "totalImportedFields": 22
};

// Field mapping for connecting imported data to default fields
export const FIELD_MAPPING: Record<string, string> = {
  "id": "assetTagId",
  "description": "description",
  "purchaseDate": "purchaseDate",
  "value": "cost",
  "purchasedFrom": "purchasedFrom",
  "brand": "brand",
  "model": "model",
  "serialNumber": "serialNumber"
};

// All imported field names
export const IMPORTED_FIELD_NAMES: string[] = [
  "id",
  "name",
  "description",
  "category",
  "subCategory",
  "location",
  "site",
  "status",
  "value",
  "purchaseDate",
  "dateAcquired",
  "assignedTo",
  "department",
  "brand",
  "model",
  "notes",
  "additionalInformation",
  "auditedApril2021",
  "assetType",
  "depreciableAsset",
  "salvageValue",
  "depreciationMethod"
];
