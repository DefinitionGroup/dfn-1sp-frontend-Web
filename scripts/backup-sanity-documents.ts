import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { getCliClient } from "sanity/cli";

async function main() {
  const outputArg = process.argv.find((argument) => argument.startsWith("--output="));
  if (!outputArg) throw new Error("Pass --output=/absolute/path/archive.tar.gz");

  const output = resolve(outputArg.slice("--output=".length));
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  if (!projectId || !dataset || !apiVersion) {
    throw new Error("Sanity environment is incomplete.");
  }

  const client = getCliClient({ apiVersion }).withConfig({
    projectId,
    dataset,
    useCdn: false,
    perspective: "raw",
  });
  const documents: Array<Record<string, unknown>> = [];
  let cursor = "";

  while (true) {
    const page = await client.fetch<Array<Record<string, unknown>>>(
      `*[_id > $cursor] | order(_id asc)[0...500]`,
      { cursor },
    );
    documents.push(...page);
    if (page.length < 500) break;
    cursor = String(page.at(-1)?._id ?? "");
    if (!cursor) throw new Error("Backup pagination returned a document without _id.");
  }

  if (!documents.length) throw new Error("Backup query returned no documents.");
  const root = mkdtempSync(`${tmpdir()}/renaissance-sanity-documents-`);
  const folderName = "renaissance-sanity-documents";
  const folder = `${root}/${folderName}`;
  mkdirSync(folder, { recursive: true });
  mkdirSync(dirname(output), { recursive: true });

  const ndjson = `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`;
  writeFileSync(`${folder}/data.ndjson`, ndjson, "utf8");
  writeFileSync(
    `${folder}/manifest.json`,
    `${JSON.stringify(
      {
        projectId,
        dataset,
        createdAt: new Date().toISOString(),
        documentCount: documents.length,
        sha256: createHash("sha256").update(ndjson).digest("hex"),
        note: "Document-level rollback archive. Asset binaries remain in Sanity/Cloudinary.",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  execFileSync("tar", ["-czf", output, "-C", root, folderName]);
  execFileSync("gzip", ["-t", output]);
  const archiveBytes = readFileSync(output).byteLength;
  rmSync(root, { recursive: true, force: true });

  console.log(
    JSON.stringify(
      { output, archive: basename(output), documentCount: documents.length, archiveBytes },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
