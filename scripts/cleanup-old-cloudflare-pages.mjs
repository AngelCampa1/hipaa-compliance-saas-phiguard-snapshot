#!/usr/bin/env node
import {
  classifyPhiguardPagesProjects,
  knownPhiguardPagesProjects,
} from "./cleanup-cloudflare-pages-policy.mjs";
import { safeSpawnSync } from "./safe-spawn.mjs";

const dryRun = process.argv.includes("--dry-run");
const confirm = process.argv.includes("--confirm");

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

function listProjects() {
  const output = run(["wrangler", "pages", "project", "list"], {
    capture: true,
  });

  return output
    .split(/\r?\n/)
    .map((line) =>
      line.replaceAll("│", "|").replaceAll("â”‚", "|").split("|")[1]?.trim(),
    )
    .filter((name) => name && name !== "Project Name");
}

const projects = listProjects();
const { deletableProjects, unallowlistedProjects } =
  classifyPhiguardPagesProjects(projects);

if (deletableProjects.length === 0) {
  console.log("No allowlisted PHIGuard Pages projects found.");
} else {
  console.log(
    `Allowlisted PHIGuard Pages projects selected for deletion: ${deletableProjects.join(", ")}`,
  );
}

if (unallowlistedProjects.length > 0) {
  throw new Error(
    `Found PHIGuard Pages projects not in the cleanup allowlist: ${unallowlistedProjects.join(", ")}. Verify ownership before deletion.`,
  );
}

for (const project of deletableProjects) {
  const command = ["wrangler", "pages", "project", "delete", project, "--yes"];

  if (dryRun || !confirm) {
    console.log(`[dry-run] ${command.join(" ")}`);
    continue;
  }

  console.log(`Deleting Cloudflare Pages project: ${project}`);
  run(command);
}

console.log(
  `\nExpected remaining PHIGuard Pages projects: none. Deleted allowlist: ${knownPhiguardPagesProjects.join(", ")}`,
);
run(["wrangler", "pages", "project", "list"]);
