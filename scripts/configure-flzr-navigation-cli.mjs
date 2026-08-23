import { getCliClient } from "sanity/cli";

const cliClient = getCliClient({
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-16",
});
const cliToken = cliClient.config().token;

if (!cliToken) {
  throw new Error(
    "No authenticated Sanity CLI token is available. Run this wrapper with --with-user-token.",
  );
}

process.env.SANITY_API_WRITE_TOKEN = cliToken;

if (
  process.env.APPLY_FLZR_NAVIGATION === "1" &&
  !process.argv.includes("--apply")
) {
  process.argv.push("--apply");
}

await import("./configure-flzr-navigation.mjs");
