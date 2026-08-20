#!/usr/bin/env bash
# Local PHIGuard run for QA — faithful workerd via wrangler dev. Always binds 3300.
#
# We derive a routeless dev config from wrangler.jsonc. The production config
# declares a custom-domain route (my.phiguard.app); under `wrangler dev` that
# makes wrangler rewrite the inbound Origin/Host to http://my.phiguard.app,
# which better-auth then rejects (trustedOrigins only has https://my.phiguard.app).
# Stripping the route lets the worker serve cleanly on localhost so auth works.
set -a; [ -f .env.local ] && . ./.env.local; set +a
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE='postgresql://phiguard:phiguard_dev@localhost:5432/phiguard'
PHIPORT="${PHIGUARD_PORT:-3300}"

# Must live in repo root: wrangler resolves main/assets paths relative to the config file.
DEV_CFG=".wrangler-dev.local.jsonc"
trap 'rm -f "$DEV_CFG"' EXIT
# Remove the production "routes" block (the only multi-line array we strip).
node -e '
  const fs = require("fs");
  let s = fs.readFileSync("wrangler.jsonc", "utf8");
  s = s.replace(/\n\s*"routes":\s*\[[\s\S]*?\],/, "");
  fs.writeFileSync(process.argv[1], s);
' "$DEV_CFG"

exec ./node_modules/.bin/wrangler dev --config "$DEV_CFG" --port "$PHIPORT" --local
