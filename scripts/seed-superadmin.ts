import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth";
import { db } from "../db/index";
import { account, user } from "../drizzle/schema/index";

export async function seedSuperadmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    throw new Error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set");
  }

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existing) {
    await db
      .update(user)
      .set({
        name,
        role: "superadmin",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existing.id));

    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(password);
    const cred = await db.query.account.findFirst({
      where: eq(account.userId, existing.id),
    });
    if (cred) {
      await db
        .update(account)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(account.id, cred.id));
    }

    console.log(`✓ Superadmin updated: ${email}`);
    return;
  }

  const ctx = await auth.$context;
  const userId = ctx.generateId({ model: "user" });
  const accountId = ctx.generateId({ model: "account" });
  const hashed = await ctx.password.hash(password);

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: "superadmin",
    isActive: true,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
  });

  console.log(`✓ Superadmin created: ${email}`);
}

export async function seedEditor() {
  const email = process.env.EDITOR_EMAIL;
  const password = process.env.EDITOR_PASSWORD;
  const name = process.env.EDITOR_NAME ?? "Commission Editor";
  if (!email || !password) return;

  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (existing) {
    await db
      .update(user)
      .set({
        name,
        role: "editor",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existing.id));

    const ctx = await auth.$context;
    const hashed = await ctx.password.hash(password);
    const cred = await db.query.account.findFirst({
      where: eq(account.userId, existing.id),
    });
    if (cred) {
      await db
        .update(account)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(account.id, cred.id));
    }

    console.log(`✓ Editor updated: ${email}`);
    return;
  }

  const ctx = await auth.$context;
  const userId = ctx.generateId({ model: "user" });
  const accountId = ctx.generateId({ model: "account" });
  const hashed = await ctx.password.hash(password);

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: "editor",
    isActive: true,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
  });

  console.log(`✓ Editor created: ${email}`);
}
