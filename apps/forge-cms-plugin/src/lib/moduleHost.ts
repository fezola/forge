import { framer } from "framer-plugin";

export async function insertDetachedComponent(
  componentId: string,
  name: string,
  code: string
): Promise<void> {
  if (!framer.isAllowedTo("createCodeFile", "addComponentInstance")) {
    throw new Error(
      "Insufficient permissions. The plugin needs permission to create code files and add component instances."
    );
  }

  const codeFile = await retry(
    () => framer.createCodeFile(
      `forge-${componentId}`.replace(/[^a-zA-Z0-9_-]/g, ""),
      code,
      { editViaPlugin: true }
    ),
    3,
    1000
  );

  if (!codeFile.exports || codeFile.exports.length === 0) {
    throw new Error("Code file was created but has no exports. The component code may be invalid.");
  }

  const exp = codeFile.exports[0];
  if (exp.type !== "component" || !exp.insertURL) {
    throw new Error(
      `Export "${exp.name || "unknown"}" is not a visual component. Expected a component export but got "${exp.type}".`
    );
  }

  await retry(
    () => framer.addComponentInstance({ url: exp.insertURL }),
    3,
    1500
  );
}

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delayMs: number
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
