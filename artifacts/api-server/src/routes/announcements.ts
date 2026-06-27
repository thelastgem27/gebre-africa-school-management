import { Router } from "express";
import { db, announcements, users } from "@workspace/db";
import { eq, desc, or, isNull } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.get("/announcements", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const schoolId = req.dbUser!.schoolId;
    const rows = schoolId
      ? await db.select().from(announcements)
          .where(or(eq(announcements.schoolId, schoolId), isNull(announcements.schoolId)))
          .orderBy(desc(announcements.createdAt))
          .limit(50)
      : await db.select().from(announcements)
          .orderBy(desc(announcements.createdAt))
          .limit(50);

    const result = await Promise.all(rows.map(async a => {
      const [author] = await db.select().from(users).where(eq(users.id, a.authorId));
      return {
        ...a,
        author: author ? { firstName: author.firstName, lastName: author.lastName } : { firstName: "System", lastName: "" },
      };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/announcements", requireAuth, requireRole("DIRECTOR", "VICE_ACADEMIC", "VICE_ADMIN"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { title, body, targetRoles } = req.body;
    const dbUser = req.dbUser!;

    const [announcement] = await db.insert(announcements).values({
      id: createId(),
      title,
      body,
      targetRoles: targetRoles || [],
      authorId: dbUser.id,
      schoolId: dbUser.schoolId,
      published: true,
    }).returning();

    res.status(201).json(announcement);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
