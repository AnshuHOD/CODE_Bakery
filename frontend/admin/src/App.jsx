import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Leads from './pages/Leads';
import Menu from './pages/Menu';
import Feedback from './pages/Feedback';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('bakery_admin_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF8F4' }}>
              <Navbar />
              <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/feedback" element={<Feedback />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
