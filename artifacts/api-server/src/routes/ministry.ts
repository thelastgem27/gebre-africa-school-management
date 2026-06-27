import { Router } from "express";
import { db, schools, students, teachers, users } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/ministry/stats", requireAuth, requireRole("MINISTRY_ADMIN", "REGION_ADMIN", "ZONE_ADMIN", "WOREDA_ADMIN", "DIRECTOR"), async (_req: AuthRequest, res) => {
  try {
    const [schoolCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schools);
    const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
    const [teacherCount] = await db.select({ count: sql<number>`count(*)::int` }).from(teachers);
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);

    res.json({
      totalSchools: schoolCount?.count ?? 0,
      totalStudents: studentCount?.count ?? 0,
      totalTeachers: teacherCount?.count ?? 0,
      totalUsers: userCount?.count ?? 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
