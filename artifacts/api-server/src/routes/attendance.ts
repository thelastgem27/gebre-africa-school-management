import { Router } from "express";
import { db, attendance, students, users, sections, grades } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole, requireSchool, type AuthRequest } from "../middlewares/auth.js";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

router.get("/attendance/section/:sectionId", requireAuth, requireRole("TEACHER", "DIRECTOR", "VICE_ACADEMIC", "RECORD_OFFICE"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { sectionId } = req.params;
    const date = req.query.date as string | undefined;

    const sectionStudents = await db.select().from(students).where(eq(students.sectionId, sectionId));

    const result = await Promise.all(sectionStudents.map(async s => {
      const [u] = await db.select().from(users).where(eq(users.id, s.userId));
      let status = null;
      if (date) {
        const dateStr = new Date(date).toISOString().split("T")[0];
        const [att] = await db.select().from(attendance)
          .where(and(
            eq(attendance.studentId, s.id),
            sql`${attendance.date}::date = ${dateStr}::date`
          ));
        status = att?.status ?? null;
      }
      return {
        id: s.id,
        studentId: s.studentId,
        name: u ? `${u.firstName} ${u.lastName}` : "Unknown",
        status,
      };
    }));
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post("/attendance", requireAuth, requireRole("TEACHER", "DIRECTOR"), requireSchool, async (req: AuthRequest, res) => {
  try {
    const { studentId, date, status } = req.body;
    const dbUser = req.dbUser!;
    if (!date) { res.status(400).json({ error: "date is required" }); return; }

    const dateStr = new Date(date).toISOString().split("T")[0];

    const [existing] = await db.select().from(attendance).where(
      and(
        eq(attendance.studentId, studentId),
        sql`${attendance.date}::date = ${dateStr}::date`
      )
    );

    if (existing) {
      const [updated] = await db.update(attendance)
        .set({ status })
        .where(eq(attendance.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(attendance).values({
        id: createId(),
        studentId,
        date: new Date(date),
        status,
        markedById: dbUser.id,
      }).returning();
      res.status(201).json(created);
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
