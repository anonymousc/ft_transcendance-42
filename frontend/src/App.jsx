import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import LoginPage from './components/LoginPage.jsx';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<LoginPage />} />
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