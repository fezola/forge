import type {
  ManagedCollection,
  ManagedCollectionFieldInput,
  ManagedCollectionItemInput,
} from "framer-plugin";
import type { ForgeRow, FieldMapping, SyncResult } from "../types/forge";
import { forgeToFramerType } from "../types/forge";

function generateSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = `-${id.slice(0, 8)}`;
  const maxLen = 64 - suffix.length;
  return `${slug.slice(0, maxLen).replace(/-$/, "")}${suffix}`;
}

function convertFieldValue(
  value: unknown,
  cmsType: string
): { type: string; value: unknown } {
  switch (cmsType) {
    case "string":
    case "formattedText":
      return { type: cmsType, value: String(value ?? "") };
    case "number":
      return { type: "number", value: Number(value ?? 0) };
    case "boolean":
      return { type: "boolean", value: Boolean(value ?? false) };
    case "date":
      return { type: "date", value: value ? String(value) : null };
    case "image":
    case "file":
    case "link":
    case "color":
      return { type: cmsType, value: value ? String(value) : null };
    case "enum":
      return { type: "enum", value: String(value ?? "") };
    default:
      return { type: "string", value: String(value ?? "") };
  }
}

function buildFields(mappings: FieldMapping[]): ManagedCollectionFieldInput[] {
  return mappings.map((m) => {
    const type = m.cmsFieldType;
    if (type === "enum") {
      return {
        id: m.cmsFieldId,
        name: m.cmsFieldName,
        type: "enum" as const,
        cases: [{ id: "default", name: "Default" }],
      };
    }
    return {
      id: m.cmsFieldId,
      name: m.cmsFieldName,
      type: type as ManagedCollectionFieldInput["type"],
    } as ManagedCollectionFieldInput;
  });
}

function buildItems(
  rows: ForgeRow[],
  mappings: FieldMapping[]
): ManagedCollectionItemInput[] {
  return rows.map((row) => {
    const fieldData: Record<string, { type: string; value: unknown }> = {};
    for (const mapping of mappings) {
      fieldData[mapping.cmsFieldId] = convertFieldValue(
        row[mapping.forgeFieldId],
        mapping.cmsFieldType
      );
    }
    return {
      id: row.id,
      slug: generateSlug(String(row.id), row.id),
      draft: false,
      fieldData: fieldData as ManagedCollectionItemInput["fieldData"],
    };
  });
}

export async function syncCollection(
  collection: ManagedCollection,
  rows: ForgeRow[],
  mappings: FieldMapping[]
): Promise<SyncResult> {
  const existingIds = new Set(await collection.getItemIds());
  const incomingIds = new Set(rows.map((r) => r.id));

  const fields = buildFields(mappings);
  const items = buildItems(rows, mappings);
  const staleIds = [...existingIds].filter((id) => !incomingIds.has(id));

  if (fields.length > 0) {
    await collection.setFields(fields);
  }

  if (staleIds.length > 0) {
    await collection.removeItems(staleIds);
  }

  await collection.addItems(items);
  await collection.setItemOrder(items.map((item) => item.id));

  return {
    added: items.filter((item) => !existingIds.has(item.id)).length,
    updated: items.filter((item) => existingIds.has(item.id)).length,
    removed: staleIds.length,
    errors: 0,
  };
}