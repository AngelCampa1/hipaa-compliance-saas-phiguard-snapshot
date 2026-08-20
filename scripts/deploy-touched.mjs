#!/usr/bin/env node
import { safeSpawnSync } from "./safe-spawn.mjs";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const forceAll = args.has("--all");
const forceWeb = args.has("--web") || args.has("--api");
const forceMarketing = args.has("--marketing");
const forcePdfs = args.has("--pdfs");

const sinceArg = process.argv.find((arg) => arg.startsWith("--since="));
const since =
  sinceArg?.slice("--since=".length) || (hasRef("HEAD~1") ? "HEAD~1" : "HEAD");

const deployTargets = [
  {
    name: "web",
    command: ["pnpm", "--filter", "@phiguard/web", "run", "deploy"],
    forced: forceAll || forceWeb,
    matches: [
      "apps/web/",
      "packages/audit/",
      "packages/auth/",
      "packages/baa/",
      "packages/billing/",
      "packages/compliance/",
      "packages/db/",
      "packages/email/",
      "packages/integration/",
      "packages/knowledge/",
      "packages/lead-magnets/",
      "packages/marketing-db/",
      "packages/pdf/",
      "packages/ui/",
      "wrangler.jsonc",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "turbo.json",
    ],
  },
  {
    name: "marketing",
    command: ["pnpm", "--filter", "@phiguard/marketing", "run", "deploy"],
    forced: forceAll || forceMarketing,
    matches: [
      "apps/marketing/",
      "packages/brand/",
      "packages/knowledge/",
      "packages/lead-magnets/",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "turbo.json",
    ],
  },
  {
    name: "pdfs",
    command: ["pnpm", "--filter", "@phiguard/pdf", "run", "build:pdfs"],
    forced: forceAll || forcePdfs,
    matches: [
      "packages/pdf/",
      "packages/brand/",
      "packages/baa/",
      "packages/billing/",
      "packages/lead-magnets/",
      "packages/ui/",
      "package.json",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "turbo.json",
    ],
  },
];

function run(command, options = {}) {
  const result = safeSpawnSync(command[0], command.slice(1), {
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const detail = options.capture ? result.stderr || result.stdout : "";
    throw new Error(
      `Command failed: ${command.join(" ")}${detail ? `\n${detail}` : ""}`,
    );
  }

  return result.stdout || "";
}

function hasRef(ref) {
  const result = safeSpawnSync("git", ["rev-parse", "--verify", "--quiet", ref], {
    stdio: "ignore",
  });

  return result.status === 0;
}

function assertValidSinceRef(ref) {
  const result = safeSpawnSync("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], {
    stdio: "ignore",
  });

  if (result.status !== 0) {
    throw new Error(`Invalid --since git ref: ${ref}`);
  }
}

function changedFiles() {
  if (forceAll || forceWeb || forceMarketing || forcePdfs) {
    return [];
  }

  assertValidSinceRef(since);

  const committed = run(["git", "diff", "--name-only", `${since}...HEAD`], {
    capture: true,
  });
  const unstaged = run(["git", "diff", "--name-only"], { capture: true });
  const staged = run(["git", "diff", "--cached", "--name-only"], {
    capture: true,
  });
  const files = new Set(
    `${committed}\n${unstaged}\n${staged}`
      .split(/\r?\n/)
      .map((file) => file.trim().replaceAll("\\", "/"))
      .filter(Boolean),
  );

  return [...files];
}

function targetTouched(target, files) {
  return (
    target.forced ||
    files.some((file) =>
      target.matches.some((match) => file === match || file.startsWith(match)),
    )
  );
}

const files = changedFiles();
const selectedTargets = deployTargets.filter((target) =>
  targetTouched(target, files),
);

if (selectedTargets.length === 0) {
  console.log(`No deployable app changes detected since ${since}.`);
  process.exit(0);
}

console.log(
  `Deploy targets: ${selectedTargets.map((target) => target.name).join(", ")}`,
);

for (const target of selectedTargets) {
  const rendered = target.command.join(" ");
  if (dryRun) {
    console.log(`[dry-run] ${rendered}`);
    continue;
  }

  console.log(`\n> ${rendered}`);
  run(target.command);
}
