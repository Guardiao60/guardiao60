import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sobre from './Pages/Sobre'; 
import Home from './Pages/Home';
import Erro from './Pages/Erro';
import Dados from './Pages/Dados';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="*" element={<Erro />} />
        <Route path="/dados" element={<Dados />} />


      </Routes>
    </Router>
  );
}

export default AppRoutes;