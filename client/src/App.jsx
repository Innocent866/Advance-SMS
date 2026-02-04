import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BrandingProvider from './context/BrandingProvider';
import { NotificationProvider } from './context/NotificationContext';
import Loader from './components/Loader';

// Eager load critical components
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';

// Lazy load everything else
const RegisterSchool = lazy(() => import('./pages/RegisterSchool'));
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
const AdminMaterialReview = lazy(() => import('./pages/AdminMaterialReview'));
const StudentMaterialList = lazy(() => import('./pages/StudentMaterialList'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const ParentPayment = lazy(() => import('./pages/ParentPayment'));
const ChildProfileParent = lazy(() => import('./pages/ChildProfileParent'));
const ParentVideos = lazy(() => import('./pages/ParentVideos'));
const ParentResults = lazy(() => import('./pages/ParentResults'));
const ParentHistory = lazy(() => import('./pages/ParentHistory'));
const ParentMaterials = lazy(() => import('./pages/ParentMaterials'));
const AdminFinanceDashboard = lazy(() => import('./pages/AdminFinanceDashboard'));

const PublicLayout = lazy(() => import('./components/PublicLayout'));
const PublicRoute = lazy(() => import('./components/PublicRoute'));

const Home = lazy(() => import('./pages/public/Home'));
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
        <Router>
          <Suspense fallback={<Loader fullScreen={true} />}>
            <Routes>
              {/* Guest Only Routes (Redirects to dashboard if logged in) */}
              <Route element={<PublicRoute />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register-school" element={<RegisterSchool />} />
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
                    <Route path="/teachers" element={<TeachersList />} />
                    <Route path="/teachers/:id" element={<TeacherDetails />} />
                    <Route path="/students" element={<StudentsList />} />
                    <Route path="/students/:id" element={<StudentDetails />} />
                    <Route path="/academic" element={<AcademicSettings />} />
                    <Route path="/content-oversight" element={<ContentOversight />} />
                    <Route path="/learning-settings" element={<LearningSettings />} />
                    <Route path="/attendance/history" element={<AttendanceHistory />} />
                    <Route path="/analytics" element={<ProtectedRoute feature="advancedAnalytics"><AnalyticsDashboard /></ProtectedRoute>} />
                    <Route path="/settings" element={<SchoolSettings />} />
                    <Route path="/settings/receipts" element={<ProtectedRoute role="school_admin"><ReceiptSettings /></ProtectedRoute>} />
                    <Route path="/assessment-config" element={<AssessmentSettings />} />

                    <Route path="/admin/reports" element={<ProtectedRoute feature="basicReports"><AdminReportDashboard /></ProtectedRoute>} />
                    <Route path="/finance" element={<ProtectedRoute role="school_admin"><AdminFinanceDashboard /></ProtectedRoute>} />
                    <Route path="/admin/learning-materials" element={<AdminMaterialReview />} />

                    {/* Teacher Routes */}
                    <Route path="/lessons/create" element={<ProtectedRoute feature="learningMaterials"><LessonGenerator /></ProtectedRoute>} />
                    <Route path="/lessons" element={<ProtectedRoute feature="learningMaterials"><LessonLibrary /></ProtectedRoute>} />
                    <Route path="/results/entry" element={<ProtectedRoute feature="continuousAssessment"><ResultEntry /></ProtectedRoute>} />
                    <Route path="/teacher-profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />
                    <Route path="/videos/manage" element={<ProtectedRoute role="teacher"><VideoManager /></ProtectedRoute>} />
                    <Route path="/my-students" element={<ProtectedRoute role="teacher"><MyStudents /></ProtectedRoute>} />
                    <Route path="/attendance/mark" element={<ProtectedRoute role="teacher"><AttendanceMarking /></ProtectedRoute>} />
                    <Route path="/teacher/ai-marking" element={<ProtectedRoute role="teacher" feature="aiMarking"><AIExamMarking /></ProtectedRoute>} />
                    <Route path="/staff/reports" element={<ProtectedRoute feature="basicReports"><StaffReportDashboard /></ProtectedRoute>} />
                    <Route path="/teacher/learning-materials" element={<ProtectedRoute role="teacher" feature="learningMaterials"><TeacherMaterialDashboard /></ProtectedRoute>} />

                    {/* Student Routes */}
                    <Route path="/videos" element={<StudentVideos />} />
                    <Route path="/student-submissions" element={<ProtectedRoute role="student"><StudentSubmissions /></ProtectedRoute>} />
                    <Route path="/student-history" element={<ProtectedRoute role="student"><StudentHistory /></ProtectedRoute>} />
                    <Route path="/student-results" element={<ProtectedRoute role="student"><StudentResults /></ProtectedRoute>} />
                    <Route path="/student-profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
                    <Route path="/student/learning-materials" element={<StudentMaterialList />} />

                    {/* Parent Routes */}
                    <Route path="/parent-dashboard" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
                    <Route path="/parent/child-profile" element={<ProtectedRoute role="parent"><ChildProfileParent /></ProtectedRoute>} />
                    <Route path="/parent/videos" element={<ProtectedRoute role="parent"><ParentVideos /></ProtectedRoute>} />
                    <Route path="/parent/results" element={<ProtectedRoute role="parent"><ParentResults /></ProtectedRoute>} />
                    <Route path="/parent/history" element={<ProtectedRoute role="parent"><ParentHistory /></ProtectedRoute>} />
                    <Route path="/parent/materials" element={<ProtectedRoute role="parent"><ParentMaterials /></ProtectedRoute>} />
                    <Route path="/parent/payments" element={<ProtectedRoute role="parent"><ParentPayment /></ProtectedRoute>} />
    
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
