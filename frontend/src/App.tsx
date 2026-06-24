import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Hero from './pages/Hero';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GlassToastProvider } from './context/GlassToastContext';
import { NotificationRealtimeProvider } from './context/NotificationRealtimeContext';
import { NavBadgesProvider } from './context/NavBadgesContext';
import GlassToastStack from './components/shared/GlassToastStack';
import NotificationGlassToasts from './features/notifications/components/NotificationGlassToasts';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Route components are code-split so the landing page (Hero) ships without the
// JS for chat, friends, planner, profile, etc. They load on navigation.
const LoginPage = lazy(() => import('./features/Login/component/LoginPage'));
const RegisterPage = lazy(() => import('./features/register/component/RegisterPage'));
const ProfilePage = lazy(() => import('./features/profile/component/ProfilePage'));
const EditProfilePage = lazy(() => import('./features/profile/component/EditProfilePage'));
const ChangePasswordPage = lazy(() => import('./features/profile/component/ChangePasswordPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const SettingsPage = lazy(() => import('./features/Settings/component/SettingsPage'));
const CityPage = lazy(() => import('./pages/CityPage'));
const Webchat = lazy(() => import('./features/chat/components/Webchat'));
const FriendsPage = lazy(() => import('./features/friends/components/FriendsPage'));
const NotificationPage = lazy(() => import('./features/notifications/NotificationPage'));
const SavedPlacesPage = lazy(() => import('./pages/SavedPlacesPage'));
const InterestsPage = lazy(() => import('./features/Interests/InterestsPage'));
const HealthcheckPage = lazy(() => import('./pages/HealthcheckPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

const RouteFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <p>Loading…</p>
  </div>
);

function AppContent() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/healthcheck" element={<HealthcheckPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/oauth-success" element={<Navigate to="/home" replace />} />
        <Route path="/webchat" element={<ProtectedRoute><Webchat /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/city" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedPlacesPage /></ProtectedRoute>} />
        <Route path="/interests" element={<ProtectedRoute><InterestsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlassToastProvider>
          <AuthProvider>
            <NotificationRealtimeProvider>
              <NavBadgesProvider>
                <AppContent />
                <NotificationGlassToasts />
                <GlassToastStack />
              </NavBadgesProvider>
            </NotificationRealtimeProvider>
          </AuthProvider>
        </GlassToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
