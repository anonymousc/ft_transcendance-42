import Header from './components/Header';
import Hero from './pages/Hero';
import LoginPage from './features/Login/component/LoginPage';
import RegisterPage from './features/register/component/RegisterPage';
import ProfilePage from './features/profile/component/ProfilePage';
import EditProfilePage from './features/profile/component/EditProfilePage';
import HomePage from './pages/HomePage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFoundPage from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import SettingsPage from './features/Settings/component/SettingsPage';
import OAuthSuccess from './pages/OAuthSuccess';
import CityPage from './pages/CityPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Webchat from './features/chat/components/Webchat.tsx';
import FriendsPage from './features/friends/components/FriendsPage';
import NotificationPage from './features/notifications/NotificationPage';
import City from './pages/CityPage';
import SavedPlacesPage from './pages/SavedPlacesPage';
// import HealthCheckPage from './pages/healthcheck';

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Hero />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/webchat" element={<ProtectedRoute><Webchat /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/city" element={<ProtectedRoute><City /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedPlacesPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
