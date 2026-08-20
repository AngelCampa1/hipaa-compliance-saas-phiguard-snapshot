import assert from "node:assert/strict";
import test from "node:test";

import { classifyPhiguardPagesProjects } from "../cleanup-cloudflare-pages-policy.mjs";

test("classifies all known PHIGuard Pages projects for deletion", () => {
  const result = classifyPhiguardPagesProjects([
    "phiguard-marketing",
    "phiguard-site",
    "phiguard",
    "unrelated-site",
  ]);

  assert.deepEqual(result.deletableProjects, [
    "phiguard-marketing",
    "phiguard-site",
    "phiguard",
  ]);
  assert.deepEqual(result.unallowlistedProjects, []);
});

test("fails closed when an unknown PHIGuard Pages project is present", () => {
  const result = classifyPhiguardPagesProjects([
    "phiguard-marketing",
    "phiguard-preview",
  ]);

  assert.deepEqual(result.deletableProjects, ["phiguard-marketing"]);
  assert.deepEqual(result.unallowlistedProjects, ["phiguard-preview"]);
});

test("fails closed for any project name beginning with phiguard", () => {
  const result = classifyPhiguardPagesProjects([
    "phiguard",
    "phiguard2",
    "phiguard_marketing",
    "phiguardsandbox",
    "not-phiguard",
  ]);

  assert.deepEqual(result.deletableProjects, ["phiguard"]);
  assert.deepEqual(result.unallowlistedProjects, [
    "phiguard2",
    "phiguard_marketing",
    "phiguardsandbox",
  ]);
});
