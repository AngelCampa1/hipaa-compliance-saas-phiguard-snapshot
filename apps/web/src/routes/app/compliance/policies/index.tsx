import { createFileRoute, redirect } from "@tanstack/react-router";

// The per-location policy "rollout" subsystem (policies + policy_assignments)
// has no production write path — only Program → Policies (program_policies +
// policy acknowledgements) is wired end to end. This legacy URL is kept as a
// permanent redirect so existing links, bookmarks, and analytics resolve to the
// single live policies surface instead of a permanently-empty page.
export const Route = createFileRoute("/app/compliance/policies/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/compliance/program/policies" });
  },
});
