import { Router } from "express";
import { db, students, users, grades, sections } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.get("/students", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const schoolId = req.dbUser!.schoolId;
    const rows = schoolId
      ? await db.select().from(students).where(eq(students.schoolId, schoolId))
      : await db.select().from(students);

    const gradeRows = await db.select().from(grades);
    const gradeMap = Object.fromEntries(gradeRows.map(g => [g.id, g]));
    const sectionRows = await db.select().from(sections);
    const sectionMap = Object.fromEntries(sectionRows.map(s => [s.id, s]));

    const result = await Promise.all(rows.map(async s => {
      const [u] = await db.select().from(users).where(eq(users.id, s.userId));
      return {
        ...s,
        user: u ? { firstName: u.firstName, lastName: u.lastName, email: u.email } : null,
        grade: s.gradeId ? gradeMap[s.gradeId] : null,
        section: s.sectionId ? sectionMap[s.sectionId] : null,
      };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/students", requireAuth, requireRole("DIRECTOR", "RECORD_OFFICE"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { firstName, middleName, lastName, email, studentId, phone } = req.body;
    const schoolId = req.dbUser!.schoolId!;

    const userId = createId();
    const [user] = await db.insert(users).values({
      id: userId,
      authUserId: createId(),
      email,
      role: "STUDENT",
      firstName,
      middleName,
      lastName,
      phone,
      schoolId,
    }).returning();

    const [student] = await db.insert(students).values({
      id: createId(),
      userId: user.id,
      schoolId,
      studentId,
    }).returning();

    res.status(201).json(student);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/sections/:sectionId/students", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const { sectionId } = req.params;
    const rows = await db.select().from(students).where(eq(students.sectionId, sectionId));
    const result = await Promise.all(rows.map(async s => {
      const [u] = await db.select().from(users).where(eq(users.id, s.userId));
      return { ...s, user: u ? { firstName: u.firstName, lastName: u.lastName } : null };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
