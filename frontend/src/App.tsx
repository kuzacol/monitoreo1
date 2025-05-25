import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import CrearProgramada from './pages/CrearProgramada';
import ProgramadasActivas from './pages/ProgramadasActivas';
import Archivadas from './pages/Archivadas';
import GestionUsuarios from './pages/GestionUsuarios';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/activas" replace />} />
            <Route path="crear" element={<CrearProgramada />} />
            <Route path="activas" element={<ProgramadasActivas />} />
            <Route path="archivadas" element={<Archivadas />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
