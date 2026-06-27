import { Request, Response, NextFunction } from "express";
import { getAuthUser } from "../lib/supabase.js";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";

export type UserRole =
  | "DIRECTOR" | "VICE_ACADEMIC" | "VICE_ADMIN" | "RECORD_OFFICE" | "HR"
  | "CASHIER" | "TEACHER" | "STUDENT" | "PARENT"
  | "WOREDA_ADMIN" | "ZONE_ADMIN" | "REGION_ADMIN" | "MINISTRY_ADMIN" | "EXAM_OFFICER";

const ADMIN_ROLES: UserRole[] = ["MINISTRY_ADMIN", "REGION_ADMIN", "ZONE_ADMIN", "WOREDA_ADMIN"];

export interface AuthRequest extends Request {
  authUser?: { id: string; email?: string };
  dbUser?: typeof users.$inferSelect;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const authUser = await getAuthUser(authHeader);
  if (!authUser) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.authUser = authUser;
  const [dbUser] = await db.select().from(users).where(eq(users.authUserId, authUser.id));
  if (dbUser) req.dbUser = dbUser;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) { res.status(401).json({ error: "Unauthorized: profile not found" }); return; }
    if (!roles.includes(req.dbUser.role as UserRole)) {
      res.status(403).json({ error: `Forbidden: requires role ${roles.join(" or ")}` });
      return;
    }
    next();
  };
}

export function requireSchool(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.dbUser) { res.status(401).json({ error: "Unauthorized: profile not found" }); return; }
  const role = req.dbUser.role as UserRole;
  if (!ADMIN_ROLES.includes(role) && !req.dbUser.schoolId) {
    res.status(403).json({ error: "Forbidden: account has no school associated" }); return;
  }
  next();
}
