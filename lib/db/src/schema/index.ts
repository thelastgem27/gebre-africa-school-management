import {
  pgTable, text, boolean, timestamp, integer, real, json,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("Role", [
  "DIRECTOR","VICE_ACADEMIC","VICE_ADMIN","RECORD_OFFICE","HR","CASHIER",
  "TEACHER","STUDENT","PARENT","WOREDA_ADMIN","ZONE_ADMIN","REGION_ADMIN",
  "MINISTRY_ADMIN","EXAM_OFFICER",
]);
export const genderEnum = pgEnum("Gender", ["MALE","FEMALE","OTHER"]);
export const attendanceStatusEnum = pgEnum("AttendanceStatus", ["PRESENT","ABSENT","LATE","EXCUSED"]);
export const feeStatusEnum = pgEnum("FeeStatus", ["PAID","PARTIAL","UNPAID"]);
export const questionTypeEnum = pgEnum("QuestionType", ["MULTIPLE_CHOICE","TRUE_FALSE","SHORT_ANSWER","ESSAY"]);
export const examStatusEnum = pgEnum("ExamStatus", ["DRAFT","PUBLISHED","CLOSED"]);
export const schoolTypeEnum = pgEnum("SchoolType", ["GOVERNMENT","PRIVATE","COMMUNITY_FAITH_BASED"]);
export const educationalLevelEnum = pgEnum("EducationalLevel", ["KINDERGARTEN","PRIMARY","SECONDARY"]);

export const countries = pgTable("countries", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const regions = pgTable("regions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  countryId: text("country_id").notNull().references(() => countries.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const zones = pgTable("zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  regionId: text("region_id").notNull().references(() => regions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const woredas = pgTable("woredas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  zoneId: text("zone_id").notNull().references(() => zones.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schools = pgTable("schools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: schoolTypeEnum("type"),
  educationalLevels: text("educational_levels").array().notNull().default([]),
  regionId: text("region_id").references(() => regions.id),
  zoneId: text("zone_id").references(() => zones.id),
  woredaId: text("woreda_id").references(() => woredas.id),
  countryId: text("country_id").references(() => countries.id),
  address: text("address"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const grades = pgTable("grades", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  schoolId: text("school_id").notNull().references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sections = pgTable("sections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gradeId: text("grade_id").notNull().references(() => grades.id),
  classTeacherId: text("class_teacher_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  authUserId: text("auth_user_id").notNull().unique(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  schoolId: text("school_id").references(() => schools.id),
  isActive: boolean("is_active").notNull().default(true),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teachers = pgTable("teachers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  schoolId: text("school_id").notNull().references(() => schools.id),
  staffCode: text("staff_code").notNull().unique(),
  qualification: text("qualification"),
  subjects: text("subjects").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  schoolId: text("school_id").notNull().references(() => schools.id),
  studentId: text("student_id").notNull().unique(),
  gradeId: text("grade_id").references(() => grades.id),
  sectionId: text("section_id").references(() => sections.id),
  dob: timestamp("dob"),
  gender: genderEnum("gender"),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const parents = pgTable("parents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  parentCode: text("parent_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id),
  date: timestamp("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  markedById: text("marked_by_id").notNull().references(() => users.id),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id),
  subject: text("subject").notNull(),
  score: real("score").notNull(),
  examType: text("exam_type").notNull(),
  academicYear: text("academic_year").notNull(),
  term: text("term").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fees = pgTable("fees", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id),
  amount: real("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  status: feeStatusEnum("status").notNull(),
  academicYear: text("academic_year").notNull(),
  term: text("term").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  schoolId: text("school_id").references(() => schools.id),
  targetRoles: text("target_roles").array().notNull().default([]),
  published: boolean("published").notNull().default(false),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  question: text("question").notNull(),
  type: questionTypeEnum("type").notNull(),
  options: json("options"),
  answer: text("answer"),
  explanation: text("explanation"),
  difficulty: integer("difficulty").notNull().default(1),
  approved: boolean("approved").notNull().default(false),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: examStatusEnum("status").notNull().default("DRAFT"),
  schoolId: text("school_id").references(() => schools.id),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const examResults = pgTable("exam_results", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id),
  studentId: text("student_id").notNull().references(() => students.id),
  score: real("score").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  answers: json("answers"),
});

export type User = typeof users.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Student = typeof students.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Score = typeof scores.$inferSelect;
export type Fee = typeof fees.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type ExamResult = typeof examResults.$inferSelect;
