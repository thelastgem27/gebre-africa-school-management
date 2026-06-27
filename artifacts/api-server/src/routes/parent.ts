import { Router } from "express";
import { db, parents, students, users, attendance, scores } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/parent/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUser = req.dbUser;
    if (!dbUser) { res.status(401).json({ error: "Unauthorized" }); return; }

    const [parent] = await db.select().from(parents).where(eq(parents.userId, dbUser.id));
    if (!parent) { res.json({ children: [] }); return; }

    const children = await db.select().from(students).where(eq(students.parentId, parent.id));
    const result = await Promise.all(children.map(async child => {
      const [u] = await db.select().from(users).where(eq(users.id, child.userId));
      const recentAttendance = await db.select().from(attendance)
        .where(eq(attendance.studentId, child.id))
        .orderBy(desc(attendance.date))
        .limit(10);
      const recentScores = await db.select().from(scores)
        .where(eq(scores.studentId, child.id))
        .limit(5);
      return {
        ...child,
        user: u ? { firstName: u.firstName, lastName: u.lastName } : null,
        attendance: recentAttendance.map(a => ({ date: a.date?.toISOString().split('T')[0], status: a.status })),
        scores: recentScores.map(s => ({ subject: s.subject, score: s.score, maxScore: 100 })),
      };
    }));
    res.json({ children: result });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
