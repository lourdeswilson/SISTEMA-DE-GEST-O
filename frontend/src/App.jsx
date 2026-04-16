import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Quartos from './pages/admin/Quartos';
import Hospedes from './pages/admin/Hospedes';
import Limpeza from './pages/admin/Limpeza';
import Manutencao from './pages/admin/Manutencao';
import Faturacao from './pages/admin/Faturacao';
import RecepcaoDashboard from './pages/recepcao/RecepcaoDashboard';
import LimpezaDashboard from './pages/limpeza/LimpezaDashboard';
import ManutencaoDashboard from './pages/manutencao/ManutencaoDashboard';
import RhDashboard from './pages/rh/RhDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/quartos" element={
            <PrivateRoute roles={['admin']}>
              <Quartos />
            </PrivateRoute>
          } />
          <Route path="/admin/hospedes" element={
            <PrivateRoute roles={['admin']}>
              <Hospedes />
            </PrivateRoute>
          } />
          <Route path="/admin/limpeza" element={
            <PrivateRoute roles={['admin']}>
              <Limpeza />
            </PrivateRoute>
          } />
          <Route path="/admin/manutencao" element={
            <PrivateRoute roles={['admin']}>
              <Manutencao />
            </PrivateRoute>
          } />
          <Route path="/admin/faturacao" element={
            <PrivateRoute roles={['admin']}>
              <Faturacao />
            </PrivateRoute>
          } />

          {/* Outros perfis */}
          <Route path="/recepcao" element={
            <PrivateRoute roles={['recepcao', 'admin']}>
              <RecepcaoDashboard />
            </PrivateRoute>
          } />
          <Route path="/limpeza" element={
            <PrivateRoute roles={['limpeza', 'admin']}>
              <LimpezaDashboard />
            </PrivateRoute>
          } />
          <Route path="/manutencao" element={
            <PrivateRoute roles={['manutencao', 'admin']}>
              <ManutencaoDashboard />
            </PrivateRoute>
          } />
          <Route path="/rh" element={
            <PrivateRoute roles={['rh', 'admin']}>
              <RhDashboard />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;