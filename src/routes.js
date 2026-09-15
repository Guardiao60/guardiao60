import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Dados from "./Pages/Dados";
import Erro from "./Pages/Erro";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/dados" element={<Dados />} />

        <Route path="*" element={<Erro />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
