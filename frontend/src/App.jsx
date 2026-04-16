import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Quartos from './pages/admin/Quartos';
import Hospedes from './pages/admin/Hospedes';
import Limpeza from './pages/admin/Limpeza';
import Manutencao from './pages/admin/Manutencao';
import Faturacao from './pages/admin/Faturacao';
import Layout from './components/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>A carregar...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="quartos" element={<Quartos />} />
        <Route path="hospedes" element={<Hospedes />} />
        <Route path="limpeza" element={<Limpeza />} />
        <Route path="manutencao" element={<Manutencao />} />
        <Route path="faturacao" element={<Faturacao />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}