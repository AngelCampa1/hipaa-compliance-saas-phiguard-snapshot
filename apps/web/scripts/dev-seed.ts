/**
 * Idempotent dev seed - creates stable login credentials for manual testing.
 *
 * Owner:  owner@phiguard.dev / TestPassword123!
 * Staff:  staff@phiguard.dev  / TestPassword123!
 * Org:    PHIGuard Dev Clinic
 *
 * Run: pnpm --filter @phiguard/web seed:dev
 */
import { hashPassword } from "better-auth/crypto";
import {
  accounts,
  getDb,
  locations,
  memberships,
  organizations,
  users,
} from "@phiguard/db/server";
import {
  assignChecklistTemplateToLocations,
  runSeed,
} from "@phiguard/compliance";
import { eq } from "drizzle-orm";

const OWNER_EMAIL = "owner@phiguard.dev";
const STAFF_EMAIL = "staff@phiguard.dev";
const PASSWORD = "TestPassword123!";
const ORG_SLUG = "phiguard-dev-clinic";
const STARTER_CHECKLIST_TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";

async function upsertUser(
  db: ReturnType<typeof getDb>,
  email: string,
  name: string,
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ email, name, emailVerified: true, emailVerifiedAt: new Date() })
    .returning();

  return created;
}

async function upsertCredentialAccount(
  db: ReturnType<typeof getDb>,
  userId: string,
  email: string,
) {
  const [existing] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);
  if (existing) return;

  const hash = await hashPassword(PASSWORD);
  await db.insert(accounts).values({
    userId,
    accountId: email,
    providerId: "credential",
    password: hash,
  });
}

async function main() {
  const db = getDb();

  // ── Users ─────────────────────────────────────────────────────────────────
  const owner = await upsertUser(db, OWNER_EMAIL, "Dev Owner");
  await upsertCredentialAccount(db, owner.id, OWNER_EMAIL);
  await db
    .update(users)
    .set({ emailVerified: true, emailVerifiedAt: new Date() })
    .where(eq(users.email, OWNER_EMAIL));

  const staff = await upsertUser(db, STAFF_EMAIL, "Dev Staff");
  await upsertCredentialAccount(db, staff.id, STAFF_EMAIL);
  await db
    .update(users)
    .set({ emailVerified: true, emailVerifiedAt: new Date() })
    .where(eq(users.email, STAFF_EMAIL));

  // ── Org ───────────────────────────────────────────────────────────────────
  let [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, ORG_SLUG))
    .limit(1);

  if (!org) {
    [org] = await db
      .insert(organizations)
      .values({
        name: "PHIGuard Dev Clinic",
        slug: ORG_SLUG,
        plan: "group",
        planStatus: "active",
        termsAcceptedAt: new Date(),
        baaSignedAt: new Date(),
        baaSignedByUserId: owner.id,
        termsAcceptedByUserId: owner.id,
        maxMembers: 25,
      })
      .returning();
  } else {
    // Ensure existing dev org always has the highest plan for full feature testing
    [org] = await db
      .update(organizations)
      .set({
        plan: "group",
        termsAcceptedAt: org.termsAcceptedAt ?? new Date(),
        termsAcceptedByUserId: org.termsAcceptedByUserId ?? owner.id,
        baaSignedAt: org.baaSignedAt ?? new Date(),
        baaSignedByUserId: org.baaSignedByUserId ?? owner.id,
      })
      .where(eq(organizations.id, org.id))
      .returning();
  }

  // ── Owner membership ──────────────────────────────────────────────────────
  const [ownerInThisOrg] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, owner.id))
    .limit(1);

  if (!ownerInThisOrg) {
    await db.insert(memberships).values({
      userId: owner.id,
      tenantId: org.id,
      role: "org_owner",
      acceptedAt: new Date(),
    });
  }

  // ── Primary location ──────────────────────────────────────────────────────
  let [primaryLocation] = await db
    .select()
    .from(locations)
    .where(eq(locations.organizationId, org.id))
    .limit(1);

  if (!primaryLocation) {
    [primaryLocation] = await db
      .insert(locations)
      .values({
        organizationId: org.id,
        name: "PHIGuard Dev Clinic Primary",
        slug: "primary",
        isPrimary: true,
      })
      .returning();
  }

  // ── Staff membership ──────────────────────────────────────────────────────
  const [staffMembership] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, staff.id))
    .limit(1);

  if (!staffMembership) {
    await db.insert(memberships).values({
      userId: staff.id,
      tenantId: org.id,
      role: "location_staff",
      acceptedAt: new Date(),
    });
  }

  // ── Compliance seed + checklist assignment ────────────────────────────────
  await runSeed(db);
  await assignChecklistTemplateToLocations(db, {
    tenantId: org.id,
    templateId: STARTER_CHECKLIST_TEMPLATE_ID,
    locationIds: [primaryLocation.id],
    actorId: owner.id,
  });

  console.log("\n✓ Dev seed complete");
  console.log(`  Owner:  ${OWNER_EMAIL}  /  ${PASSWORD}`);
  console.log(`  Staff:  ${STAFF_EMAIL}  /  ${PASSWORD}`);
  console.log(`  Org:    PHIGuard Dev Clinic  (slug: ${ORG_SLUG})`);
}

main().catch((err) => {
  console.error("Dev seed failed:", err);
  process.exit(1);
});
