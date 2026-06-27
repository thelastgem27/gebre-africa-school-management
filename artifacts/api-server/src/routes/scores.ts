import { Router } from "express";
import { db, scores, students } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.post("/scores/bulk", requireAuth, requireRole("TEACHER", "DIRECTOR", "VICE_ACADEMIC"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { subject, examType, academicYear, term, scores: scoreEntries } = req.body;
    const dbUser = req.dbUser!;

    if (dbUser.schoolId) {
      for (const entry of scoreEntries as { studentId: string; score: number }[]) {
        const [student] = await db.select().from(students).where(eq(students.id, entry.studentId));
        if (!student || student.schoolId !== dbUser.schoolId) {
          res.status(403).json({ error: `Forbidden: student ${entry.studentId} does not belong to your school` });
          return;
        }
      }
    }

    const inserted = await Promise.all(
      (scoreEntries as { studentId: string; score: number }[]).map(async (entry) => {
        const [created] = await db.insert(scores).values({
          id: createId(),
          studentId: entry.studentId,
          subject,
          score: entry.score,
          examType,
          academicYear,
          term,
        }).returning();
        return created;
      })
    );
    res.status(201).json(inserted);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
