import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BrandingProvider from './context/BrandingProvider';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Loader from './components/Loader';

// Eager load critical components - CHANGED TO LAZY
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));

// Lazy load everything else
const RegisterSchool = lazy(() => import('./pages/RegisterSchool'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const AcademicSettings = lazy(() => import('./pages/AcademicSettings'));
const ContentOversight = lazy(() => import('./pages/ContentOversight'));
const LearningSettings = lazy(() => import('./pages/LearningSettings'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const SchoolSettings = lazy(() => import('./pages/SchoolSettings'));
const ReceiptSettings = lazy(() => import('./pages/admin/ReceiptSettings'));
const TeachersList = lazy(() => import('./pages/TeachersList'));
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'));
const VideoManager = lazy(() => import('./pages/VideoManager'));
const MyStudents = lazy(() => import('./pages/MyStudents'));
const StudentsList = lazy(() => import('./pages/StudentsList'));
const LessonGenerator = lazy(() => import('./pages/LessonGenerator'));
const LessonLibrary = lazy(() => import('./pages/LessonLibrary'));
const StudentVideos = lazy(() => import('./pages/StudentVideos'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentSubmissions = lazy(() => import('./pages/StudentSubmissions'));
const StudentHistory = lazy(() => import('./pages/StudentHistory'));
const TeacherDetails = lazy(() => import('./pages/TeacherDetails'));
const StudentDetails = lazy(() => import('./pages/StudentDetails'));
const AssessmentSettings = lazy(() => import('./pages/AssessmentSettings'));
const ResultEntry = lazy(() => import('./pages/ResultEntry'));
const StudentResults = lazy(() => import('./pages/StudentResults'));
const AIExamMarking = lazy(() => import('./pages/AIExamMarking'));
const AttendanceMarking = lazy(() => import('./pages/AttendanceMarking'));
const AttendanceHistory = lazy(() => import('./pages/AttendanceHistory'));

const StaffReportDashboard = lazy(() => import('./pages/StaffReportDashboard'));
const AdminReportDashboard = lazy(() => import('./pages/AdminReportDashboard'));
const TeacherMaterialDashboard = lazy(() => import('./pages/TeacherMaterialDashboard'));
const StaffChat = lazy(() => import('./pages/StaffChat'));

const AdminMaterialReview = lazy(() => import('./pages/AdminMaterialReview'));
const DepartmentSettings = lazy(() => import('./pages/DepartmentSettings'));
const DepartmentReview = lazy(() => import('./pages/DepartmentReview'));
const StudentMaterialList = lazy(() => import('./pages/StudentMaterialList'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const ParentPayment = lazy(() => import('./pages/ParentPayment'));
const ChildProfileParent = lazy(() => import('./pages/ChildProfileParent'));
const ParentVideos = lazy(() => import('./pages/ParentVideos'));
const ParentResults = lazy(() => import('./pages/ParentResults'));
const ParentHistory = lazy(() => import('./pages/ParentHistory'));
const ParentMaterials = lazy(() => import('./pages/ParentMaterials'));
const ParentAttendance = lazy(() => import('./pages/ParentAttendance'));
const AdminFinanceDashboard = lazy(() => import('./pages/AdminFinanceDashboard'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));

// Boarding & Hostel
const BoardingManagement = lazy(() => import('./pages/BoardingManagement'));
const HostelManagement = lazy(() => import('./pages/HostelManagement'));
const HostelRooms = lazy(() => import('./pages/HostelRooms'));
const HostelAttendance = lazy(() => import('./pages/HostelAttendance'));
const RoomAllocation = lazy(() => import('./pages/RoomAllocation'));
const BoardingMedical = lazy(() => import('./pages/BoardingMedical'));
const BoardingReports = lazy(() => import('./pages/BoardingReports'));
const MealTracking = lazy(() => import('./pages/MealTracking'));
const DisciplineManagement = lazy(() => import('./pages/DisciplineManagement'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));

const PublicLayout = lazy(() => import('./components/PublicLayout'));
const PublicRoute = lazy(() => import('./components/PublicRoute'));
const BulkStudentUpload = lazy(() => import('./pages/BulkStudentUpload'));



const Home = lazy(() => import('./pages/public/Home'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const About = lazy(() => import('./pages/public/About'));
const Features = lazy(() => import('./pages/public/Features'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const HelpCenter = lazy(() => import('./pages/public/HelpCenter'));
const HelpCategory = lazy(() => import('./pages/public/HelpCategory'));
const Blog = lazy(() => import('./pages/public/Blog'));
const Community = lazy(() => import('./pages/public/Community'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <NotificationProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Suspense fallback={<Loader fullScreen={true} />}>
            <CookieConsent />
            <Routes>
              <Route path="/bulk-upload-portal" element={<BulkStudentUpload />} />
              {/* Guest Only Routes (Redirects to dashboard if logged in) */}
              <Route element={<PublicRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register-school" element={<RegisterSchool />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
              </Route>
              
              {/* Public Pages (Accessible by everyone) */}
              <Route element={<PublicLayout />}>
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/help/:category" element={<HelpCategory />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/community" element={<Community />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                 <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardHome />} />
                    <Route path="/super-admin" element={<ProtectedRoute role="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/teachers" element={<ProtectedRoute role="school_admin"><TeachersList /></ProtectedRoute>} />
                    <Route path="/teachers/:id" element={<ProtectedRoute role="school_admin"><TeacherDetails /></ProtectedRoute>} />
                    <Route path="/students" element={<ProtectedRoute role="school_admin"><StudentsList /></ProtectedRoute>} />
                    <Route path="/students/:id" element={<ProtectedRoute role={['school_admin', 'teacher']}><StudentDetails /></ProtectedRoute>} />
                    <Route path="/academic" element={<ProtectedRoute role="school_admin"><AcademicSettings /></ProtectedRoute>} />
                    <Route path="/content-oversight" element={<ProtectedRoute role="school_admin" module="learningManagement"><ContentOversight /></ProtectedRoute>} />
                    <Route path="/learning-settings" element={<ProtectedRoute role="school_admin" module="learningManagement"><LearningSettings /></ProtectedRoute>} />
                    <Route path="/attendance/history" element={<ProtectedRoute module="attendanceTracking"><AttendanceHistory /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute feature="advancedAnalytics" module="advancedAnalytics"><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute role="school_admin"><SchoolSettings /></ProtectedRoute>} />
                    <Route path="/settings/receipts" element={<ProtectedRoute role="school_admin" module="financials"><ReceiptSettings /></ProtectedRoute>} />
                    <Route path="/admin/management" element={<ProtectedRoute role="school_admin"><AdminManagement /></ProtectedRoute>} />
                    <Route path="/assessment-config" element={<ProtectedRoute role="school_admin" module="continuousAssessment"><AssessmentSettings /></ProtectedRoute>} />

                    <Route path="/admin/reports" element={<ProtectedRoute feature="basicReports" module="basicReports"><AdminReportDashboard /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute role="school_admin" module="financials"><AdminFinanceDashboard /></ProtectedRoute>} />
                    <Route path="/admin/learning-materials" element={<ProtectedRoute module="learningMaterials"><AdminMaterialReview /></ProtectedRoute>} />

                    {/* Teacher Routes */}
                    <Route path="/lessons/create" element={<ProtectedRoute feature="learningMaterials" module="learningManagement"><LessonGenerator /></ProtectedRoute>} />
                    <Route path="/lessons" element={<ProtectedRoute feature="learningMaterials" module="learningManagement"><LessonLibrary /></ProtectedRoute>} />
                    <Route path="/results/entry" element={<ProtectedRoute feature="continuousAssessment" module="continuousAssessment"><ResultEntry /></ProtectedRoute>} />
                    <Route path="/teacher-profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />
                    <Route path="/videos/manage" element={<ProtectedRoute role="teacher" module="videoManager"><VideoManager /></ProtectedRoute>} />
                    <Route path="/my-students" element={<ProtectedRoute role="teacher"><MyStudents /></ProtectedRoute>} />
                    <Route path="/attendance/mark" element={<ProtectedRoute role="teacher" module="attendanceTracking"><AttendanceMarking /></ProtectedRoute>} />
                    <Route path="/teacher/ai-marking" element={<ProtectedRoute role="teacher" feature="aiMarking" module="aiMarking"><AIExamMarking /></ProtectedRoute>} />

                    <Route path="/staff/reports" element={<ProtectedRoute feature="basicReports" module="basicReports"><StaffReportDashboard /></ProtectedRoute>} />
                    <Route path="/staff/chat" element={<ProtectedRoute feature="staffAdminComm" module="staffAdminComm"><StaffChat /></ProtectedRoute>} />
                    <Route path="/admin/departments" element={<ProtectedRoute role="school_admin"><DepartmentSettings /></ProtectedRoute>} />
                    <Route path="/department/review" element={<ProtectedRoute module="learningMaterials"><DepartmentReview /></ProtectedRoute>} />
                    <Route path="/teacher/learning-materials" element={<ProtectedRoute role="teacher" feature="learningMaterials" module="learningMaterials"><TeacherMaterialDashboard /></ProtectedRoute>} />

                    {/* Boarding & Hostel Routes */}
                    <Route path="/boarding" element={<ProtectedRoute role={['school_admin', 'super_admin', 'hostel_warden', 'house_parent']} module="boarding"><BoardingManagement /></ProtectedRoute>} />
                    <Route path="/hostel-management" element={<ProtectedRoute role={['school_admin', 'super_admin', 'assistant_admin']} module="boarding"><HostelManagement /></ProtectedRoute>} />
                    <Route path="/hostel-management/:id/rooms" element={<ProtectedRoute role={['school_admin', 'super_admin', 'assistant_admin']} module="boarding"><HostelRooms /></ProtectedRoute>} />
                    <Route path="/boarding/roll-call" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="boarding"><HostelAttendance /></ProtectedRoute>} />
                    <Route path="/boarding/allocate" element={<ProtectedRoute role={['school_admin', 'assistant_admin']} module="boarding"><RoomAllocation /></ProtectedRoute>} />
                    <Route path="/boarding/medical" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="medicalRecords"><BoardingMedical /></ProtectedRoute>} />
                    <Route path="/boarding/reports" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="boarding"><BoardingReports /></ProtectedRoute>} />
                    <Route path="/boarding/meals" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="boarding"><MealTracking /></ProtectedRoute>} />
                    <Route path="/boarding/discipline" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="disciplineManagement"><DisciplineManagement /></ProtectedRoute>} />
                    <Route path="/boarding/leaves" element={<ProtectedRoute role={['school_admin', 'assistant_admin', 'hostel_warden', 'house_parent']} module="boarding"><LeaveManagement /></ProtectedRoute>} />

                    {/* Student Routes */}
                    <Route path="/videos" element={<ProtectedRoute module="videoManager"><StudentVideos /></ProtectedRoute>} />
                    <Route path="/student-submissions" element={<ProtectedRoute role="student" module="learningManagement"><StudentSubmissions /></ProtectedRoute>} />
                    <Route path="/student-history" element={<ProtectedRoute role="student" module="attendanceTracking"><StudentHistory /></ProtectedRoute>} />
                    <Route path="/student-results" element={<ProtectedRoute role="student" module="continuousAssessment"><StudentResults /></ProtectedRoute>} />
                    <Route path="/student-profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
                    <Route path="/student/learning-materials" element={<ProtectedRoute module="learningMaterials"><StudentMaterialList /></ProtectedRoute>} />

                    {/* Parent Routes */}
                    <Route path="/parent-dashboard" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
                    <Route path="/parent/child-profile" element={<ProtectedRoute role="parent"><ChildProfileParent /></ProtectedRoute>} />
                    <Route path="/parent/videos" element={<ProtectedRoute role="parent" module="videoManager"><ParentVideos /></ProtectedRoute>} />
                    <Route path="/parent/results" element={<ProtectedRoute role="parent" module="continuousAssessment"><ParentResults /></ProtectedRoute>} />
                    <Route path="/parent/history" element={<ProtectedRoute role="parent" module="attendanceTracking"><ParentHistory /></ProtectedRoute>} />
                    <Route path="/parent/materials" element={<ProtectedRoute role="parent" module="learningMaterials"><ParentMaterials /></ProtectedRoute>} />
                    <Route path="/parent/attendance" element={<ProtectedRoute role="parent" module="attendanceTracking"><ParentAttendance /></ProtectedRoute>} />
                    <Route path="/parent/payments" element={<ProtectedRoute role="parent" module="financials"><ParentPayment /></ProtectedRoute>} />
    
                 </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
