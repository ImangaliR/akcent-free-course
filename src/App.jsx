import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />}></Route>
      <Route path="/signup" element={<SignUp />}></Route>
      <Route index element={<Navigate to="/login" replace />}></Route>
    </Routes>
  );
}

export default App;
