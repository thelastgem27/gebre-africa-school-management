import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  const u = req.dbUser;
  if (!u) { res.status(404).json({ error: "Profile not found" }); return; }
  res.json({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    email: u.email,
    schoolId: u.schoolId,
    onboardingDone: u.onboardingDone,
  });
});

export default router;
