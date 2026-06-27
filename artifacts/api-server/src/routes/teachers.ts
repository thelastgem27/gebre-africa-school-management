import { Router } from "express";
import { db, teachers, users, sections, grades } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.get("/teachers", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const schoolId = req.dbUser!.schoolId;
    const rows = schoolId
      ? await db.select().from(teachers).where(eq(teachers.schoolId, schoolId))
      : await db.select().from(teachers);

    const result = await Promise.all(rows.map(async (t) => {
      const [u] = await db.select().from(users).where(eq(users.id, t.userId));
      return { ...t, user: u ? { firstName: u.firstName, lastName: u.lastName, email: u.email } : null };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/teachers", requireAuth, requireRole("DIRECTOR", "HR"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { firstName, middleName, lastName, email, staffCode, phone, subjects, qualification } = req.body;
    const schoolId = req.dbUser!.schoolId!;

    const userId = createId();
    const [user] = await db.insert(users).values({
      id: userId,
      authUserId: createId(),
      email,
      role: "TEACHER",
      firstName,
      middleName,
      lastName,
      phone,
      schoolId,
    }).returning();

    const [teacher] = await db.insert(teachers).values({
      id: createId(),
      userId: user.id,
      schoolId,
      staffCode,
      qualification,
      subjects: subjects || [],
    }).returning();

    res.status(201).json(teacher);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/teacher/sections", requireAuth, requireRole("TEACHER"), async (req: AuthRequest, res) => {
  try {
    const userId = req.dbUser!.id;
    const allSections = await db.select().from(sections).where(eq(sections.classTeacherId, userId));

    const result = await Promise.all(allSections.map(async (s) => {
      const [grade] = await db.select().from(grades).where(eq(grades.id, s.gradeId));
      return { ...s, grade: grade ?? null };
    }));

    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
