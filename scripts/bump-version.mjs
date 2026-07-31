#!/usr/bin/env node
//
// Bump the site version for a production release.
//
// Scheme: 1.<mmdd>.<previous patch + 1>
//   - major  stays 1
//   - minor  is the release date as zero-padded month+day (Asia/Jerusalem, the
//            timezone the rest of the fleet stamps its builds in)
//   - patch  is a monotonic counter: previous patch + 1, so it always advances
//            even when the day (and therefore the minor) rolls over
//
// package.json is the single source of truth for the version. The deploy
// workflow runs this, then commits the bumped file back to main — so the number
// in the repo always names the last release that actually went out.
//
// Prints the new version to stdout (nothing else) so the workflow can capture it.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

// The current patch is the third dotted component; treat anything unparseable
// (e.g. the initial "1.0.0") as 0 so the first bump lands on patch 1.
const prevPatch = Number.parseInt(String(pkg.version ?? "").split(".")[2], 10);
const newPatch = (Number.isFinite(prevPatch) ? prevPatch : 0) + 1;

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jerusalem", month: "2-digit", day: "2-digit",
}).formatToParts(new Date());
const mm = parts.find((p) => p.type === "month").value;
const dd = parts.find((p) => p.type === "day").value;

const newVersion = `1.${mm}${dd}.${newPatch}`;
pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(newVersion);
