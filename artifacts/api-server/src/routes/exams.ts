import { Router } from "express";
import { db, exams, questions, examResults, students, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.get("/exam/questions", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const schoolId = req.dbUser!.schoolId;
    const rows = await db.select().from(questions);

    const result = await Promise.all(rows.map(async q => {
      const [creator] = await db.select().from(users).where(eq(users.id, q.createdById));
      return {
        ...q,
        createdBy: creator ? { firstName: creator.firstName, lastName: creator.lastName } : { firstName: "Unknown", lastName: "" },
      };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/exam/questions/:id/approve", requireAuth, requireRole("DIRECTOR", "EXAM_OFFICER", "VICE_ACADEMIC"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const [q] = await db.update(questions).set({ approved: true }).where(eq(questions.id, req.params.id)).returning();
    res.json(q);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete("/exam/questions/:id", requireAuth, requireRole("DIRECTOR", "EXAM_OFFICER", "VICE_ACADEMIC"), requireSchool, async (req: AuthRequest, res) => {
  try {
    await db.delete(questions).where(eq(questions.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/exams", requireAuth, requireRole("DIRECTOR", "EXAM_OFFICER", "VICE_ACADEMIC"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { title, subject, gradeLevel, duration } = req.body;
    const dbUser = req.dbUser!;

    const [exam] = await db.insert(exams).values({
      id: createId(),
      title,
      subject,
      gradeLevel: gradeLevel || "",
      durationMinutes: duration || 60,
      createdById: dbUser.id,
      schoolId: dbUser.schoolId,
    }).returning();
    res.status(201).json(exam);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/exams/results", requireAuth, requireSchool, async (req: AuthRequest, res) => {
  try {
    const rows = await db.select().from(examResults);

    const result = await Promise.all(rows.map(async r => {
      const [exam] = await db.select().from(exams).where(eq(exams.id, r.examId));
      const [student] = await db.select().from(students).where(eq(students.id, r.studentId));
      const user = student ? (await db.select().from(users).where(eq(users.id, student.userId)))[0] : null;
      return {
        ...r,
        exam,
        student: { ...student, user: user ? { firstName: user.firstName, lastName: user.lastName } : null },
        maxScore: 100,
        passed: r.score >= 50,
      };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
