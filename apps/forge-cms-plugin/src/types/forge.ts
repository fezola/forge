export interface ForgeTable {
  id: string;
  name: string;
  fields: ForgeField[];
  itemCount?: number;
}

export interface ForgeField {
  id: string;
  name: string;
  type: ForgeFieldType;
  required: boolean;
}

export type ForgeFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "image"
  | "file"
  | "link"
  | "color"
  | "enum"
  | "json";

export interface ForgeRow {
  id: string;
  [key: string]: unknown;
}

export interface ForgeConnectionConfig {
  apiKey: string;
  projectId: string;
  baseUrl: string;
}

export interface CollectionConfig {
  tableId: string;
  slugFieldId: string;
  fieldMapping: FieldMapping[];
}

export interface FieldMapping {
  forgeFieldId: string;
  cmsFieldId: string;
  cmsFieldName: string;
  cmsFieldType: string;
}

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
  errors: number;
}

export const PLUGIN_STORAGE_KEYS = {
  CONNECTION: "forgeConnection",
  COLLECTION_CONFIG: "forgeCollectionConfig",
  LAST_SYNCED: "forgeLastSynced",
} as const;

export const FRAMER_FIELD_TYPES = [
  { value: "string", label: "Text" },
  { value: "formattedText", label: "Rich Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "image", label: "Image" },
  { value: "file", label: "File" },
  { value: "link", label: "Link" },
  { value: "date", label: "Date" },
  { value: "color", label: "Color" },
  { value: "enum", label: "Enum" },
] as const;

export function forgeToFramerType(forgeType: ForgeFieldType): string {
  const map: Record<ForgeFieldType, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    date: "date",
    image: "image",
    file: "file",
    link: "link",
    color: "color",
    enum: "string",
    json: "formattedText",
  };
  return map[forgeType] || "string";
}