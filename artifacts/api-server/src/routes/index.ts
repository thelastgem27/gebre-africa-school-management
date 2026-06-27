import { Router } from "express";
import healthRouter from "./health";
import geoRouter from "./geo";
import meRouter from "./me";
import studentsRouter from "./students";
import teachersRouter from "./teachers";
import announcementsRouter from "./announcements";
import attendanceRouter from "./attendance";
import feesRouter from "./fees";
import scoresRouter from "./scores";
import examsRouter from "./exams";
import directorRouter from "./director";
import parentRouter from "./parent";
import onboardingRouter from "./onboarding";
import ministryRouter from "./ministry";

const router = Router();

router.use(healthRouter);
router.use(geoRouter);
router.use(meRouter);
router.use(studentsRouter);
router.use(teachersRouter);
router.use(announcementsRouter);
router.use(attendanceRouter);
router.use(feesRouter);
router.use(scoresRouter);
router.use(examsRouter);
router.use(directorRouter);
router.use(parentRouter);
router.use(onboardingRouter);
router.use(ministryRouter);

export default router;
