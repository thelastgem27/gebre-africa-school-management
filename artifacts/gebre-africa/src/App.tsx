import { Switch, Route, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/i18n/context';
import { AuthGuard } from '@/components/auth/AuthGuard';

import LoginPage from '@/pages/auth/LoginPage';
import SignupStep1Page from '@/pages/auth/SignupStep1Page';
import SignupStep2Page from '@/pages/auth/SignupStep2Page';
import SignupVerifyPage from '@/pages/auth/SignupVerifyPage';
import SignupRoleSelectionPage from '@/pages/auth/SignupRoleSelectionPage';
import SignupRoleInformationPage from '@/pages/auth/SignupRoleInformationPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

import DirectorDashboardPage from '@/pages/director/DashboardPage';
import DirectorAnnouncementsPage from '@/pages/director/AnnouncementsPage';
import DirectorStaffPage from '@/pages/director/StaffPage';
import DirectorSchoolPage from '@/pages/director/SchoolPage';
import DirectorAcademicPage from '@/pages/director/AcademicPage';

import HRDashboardPage from '@/pages/hr/DashboardPage';
import CashierFeesPage from '@/pages/cashier/FeesPage';

import RecordOfficeStudentsPage from '@/pages/record-office/StudentsPage';
import RecordOfficeAddStudentPage from '@/pages/record-office/AddStudentPage';
import RecordOfficeTeachersPage from '@/pages/record-office/TeachersPage';
import RecordOfficeAddTeacherPage from '@/pages/record-office/AddTeacherPage';

import TeacherAttendancePage from '@/pages/teacher/AttendancePage';
import TeacherScoresPage from '@/pages/teacher/ScoresPage';

import ParentDashboardPage from '@/pages/parent/DashboardPage';

import ViceAcademicDashboardPage from '@/pages/vice-academic/DashboardPage';
import ViceAdminDashboardPage from '@/pages/vice-admin/DashboardPage';

import WoredaDashboardPage from '@/pages/woreda/DashboardPage';
import ZoneDashboardPage from '@/pages/zone/DashboardPage';
import MinistryDashboardPage from '@/pages/ministry/DashboardPage';

import ExamQuestionBankPage from '@/pages/exam/QuestionBankPage';
import ExamCreatePage from '@/pages/exam/CreateExamPage';
import ExamResultsPage from '@/pages/exam/ResultsPage';

import ComingSoonPage from '@/pages/ComingSoonPage';
import IndexRedirect from '@/pages/IndexRedirect';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const CS = (title: string) => () => <AuthGuard><ComingSoonPage title={title} /></AuthGuard>;

function Router() {
  return (
    <Switch>
      <Route path="/" component={IndexRedirect} />

      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={() => <Redirect to="/signup/step-1" />} />
      <Route path="/signup/step-1" component={SignupStep1Page} />
      <Route path="/signup/step-2" component={SignupStep2Page} />
      <Route path="/signup/verify" component={SignupVerifyPage} />
      <Route path="/signup/role-selection" component={SignupRoleSelectionPage} />
      <Route path="/signup/role-information" component={SignupRoleInformationPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/role-selection" component={SignupRoleSelectionPage} />
      <Route path="/onboarding/director" component={SignupRoleInformationPage} />

      {/* Director */}
      <Route path="/director/dashboard" component={() => <AuthGuard><DirectorDashboardPage /></AuthGuard>} />
      <Route path="/director/announcements" component={() => <AuthGuard><DirectorAnnouncementsPage /></AuthGuard>} />
      <Route path="/director/school" component={() => <AuthGuard><DirectorSchoolPage /></AuthGuard>} />
      <Route path="/director/staff" component={() => <AuthGuard><DirectorStaffPage /></AuthGuard>} />
      <Route path="/director/academic" component={() => <AuthGuard><DirectorAcademicPage /></AuthGuard>} />
      <Route path="/director/attendance" component={CS('Attendance Overview')} />
      <Route path="/director/reports" component={CS('Reports')} />
      <Route path="/director/settings" component={CS('Settings')} />

      {/* Vice Academic */}
      <Route path="/vice-academic/dashboard" component={() => <AuthGuard><ViceAcademicDashboardPage /></AuthGuard>} />
      <Route path="/vice-academic/academic" component={CS('Academic Management')} />
      <Route path="/vice-academic/teachers" component={CS('Teachers')} />
      <Route path="/vice-academic/scores" component={CS('Scores')} />
      <Route path="/vice-academic/reports" component={CS('Reports')} />

      {/* Vice Admin */}
      <Route path="/vice-admin/dashboard" component={() => <AuthGuard><ViceAdminDashboardPage /></AuthGuard>} />
      <Route path="/vice-admin/administration" component={CS('Administration')} />
      <Route path="/vice-admin/staff" component={CS('Staff')} />
      <Route path="/vice-admin/finance" component={CS('Finance')} />
      <Route path="/vice-admin/reports" component={CS('Reports')} />

      {/* HR */}
      <Route path="/hr/dashboard" component={() => <AuthGuard><HRDashboardPage /></AuthGuard>} />
      <Route path="/hr/staff" component={CS('Staff')} />
      <Route path="/hr/departments" component={CS('Departments')} />
      <Route path="/hr/attendance" component={CS('Attendance')} />
      <Route path="/hr/leave" component={CS('Leave Management')} />
      <Route path="/hr/payroll" component={CS('Payroll')} />
      <Route path="/hr/reports" component={CS('Reports')} />

      {/* Cashier */}
      <Route path="/cashier/fees" component={() => <AuthGuard><CashierFeesPage /></AuthGuard>} />
      <Route path="/cashier/dashboard" component={CS('Cashier Dashboard')} />
      <Route path="/cashier/reports" component={CS('Reports')} />

      {/* Record Office */}
      <Route path="/record-office/students" component={() => <AuthGuard><RecordOfficeStudentsPage /></AuthGuard>} />
      <Route path="/record-office/students/add" component={() => <AuthGuard><RecordOfficeAddStudentPage /></AuthGuard>} />
      <Route path="/record-office/teachers" component={() => <AuthGuard><RecordOfficeTeachersPage /></AuthGuard>} />
      <Route path="/record-office/teachers/add" component={() => <AuthGuard><RecordOfficeAddTeacherPage /></AuthGuard>} />
      <Route path="/record-office/dashboard" component={CS('Record Office Dashboard')} />
      <Route path="/record-office/scores" component={CS('Scores')} />
      <Route path="/record-office/reports" component={CS('Reports')} />

      {/* Teacher */}
      <Route path="/teacher/attendance" component={() => <AuthGuard><TeacherAttendancePage /></AuthGuard>} />
      <Route path="/teacher/scores" component={() => <AuthGuard><TeacherScoresPage /></AuthGuard>} />
      <Route path="/teacher/dashboard" component={CS('Teacher Dashboard')} />
      <Route path="/teacher/my-classes" component={CS('My Classes')} />

      {/* Parent */}
      <Route path="/parent/dashboard" component={() => <AuthGuard><ParentDashboardPage /></AuthGuard>} />

      {/* Admin hierarchy */}
      <Route path="/woreda/dashboard" component={() => <AuthGuard><WoredaDashboardPage /></AuthGuard>} />
      <Route path="/woreda/schools" component={CS('Schools')} />
      <Route path="/woreda/reports" component={CS('Reports')} />

      <Route path="/zone/dashboard" component={() => <AuthGuard><ZoneDashboardPage /></AuthGuard>} />
      <Route path="/zone/woredas" component={CS('Woredas')} />
      <Route path="/zone/reports" component={CS('Reports')} />

      <Route path="/region/dashboard" component={() => <AuthGuard><WoredaDashboardPage /></AuthGuard>} />
      <Route path="/region/zones" component={CS('Zones')} />
      <Route path="/region/reports" component={CS('Reports')} />

      <Route path="/ministry/dashboard" component={() => <AuthGuard><MinistryDashboardPage /></AuthGuard>} />

      {/* Exam */}
      <Route path="/exam/question-bank" component={() => <AuthGuard><ExamQuestionBankPage /></AuthGuard>} />
      <Route path="/exam/create-exam" component={() => <AuthGuard><ExamCreatePage /></AuthGuard>} />
      <Route path="/exam/results" component={() => <AuthGuard><ExamResultsPage /></AuthGuard>} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
