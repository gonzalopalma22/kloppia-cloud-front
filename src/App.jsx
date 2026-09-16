import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Materias from './pages/Materias';
import Apuntes from './pages/Apuntes';
import Estudio from './pages/Estudio';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/materias" element={<PrivateRoute><Materias /></PrivateRoute>} />
      <Route path="/materias/:id/apuntes" element={<PrivateRoute><Apuntes /></PrivateRoute>} />
      <Route path="/materias/:id/apuntes/:apunteId/estudio" element={<PrivateRoute><Estudio /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;