import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // To be created
import Login from './pages/Login'; // To be created
import RegisterSchool from './pages/RegisterSchool'; // To be created
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DashboardLayout from './components/DashboardLayout'; // To be created
import DashboardHome from './pages/DashboardHome';
import AcademicSettings from './pages/AcademicSettings';
import ContentOversight from './pages/ContentOversight';
import LearningSettings from './pages/LearningSettings';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SchoolSettings from './pages/SchoolSettings';
import TeachersList from './pages/TeachersList';
import TeacherProfile from './pages/TeacherProfile';
import VideoManager from './pages/VideoManager';
import MyStudents from './pages/MyStudents';
import StudentsList from './pages/StudentsList';
import LessonGenerator from './pages/LessonGenerator';
import LessonLibrary from './pages/LessonLibrary';
import StudentVideos from './pages/StudentVideos';
import StudentProfile from './pages/StudentProfile';
import StudentSubmissions from './pages/StudentSubmissions';
import StudentHistory from './pages/StudentHistory';
import TeacherDetails from './pages/TeacherDetails';
import StudentDetails from './pages/StudentDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-school" element={<RegisterSchool />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/settings" element={<SchoolSettings />} />

                {/* Teacher Routes */}
                <Route path="/lessons/create" element={<LessonGenerator />} />
                <Route path="/lessons" element={<LessonLibrary />} />
                <Route path="/teacher-profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />
                <Route path="/videos/manage" element={<ProtectedRoute role="teacher"><VideoManager /></ProtectedRoute>} />
          <Route path="/my-students" element={<ProtectedRoute role="teacher"><MyStudents /></ProtectedRoute>} />

                {/* Student Routes */}
                <Route path="/videos" element={<StudentVideos />} />
                <Route path="/student-submissions" element={<ProtectedRoute role="student"><StudentSubmissions /></ProtectedRoute>} />
                <Route path="/student-history" element={<ProtectedRoute role="student"><StudentHistory /></ProtectedRoute>} />
                <Route path="/student-profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
             </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
