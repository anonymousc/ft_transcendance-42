import Header from './components/Header';
import Hero from './pages/Hero';
import LoginPage from './features/Login/component/LoginPage';
import RegisterPage from './features/register/component/RegisterPage';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NotFoundPage from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App