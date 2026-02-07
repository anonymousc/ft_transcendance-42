import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/home';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </>
  );
}

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App