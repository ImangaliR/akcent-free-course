import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminPanel } from "./AdminPanel";
import { SignUp } from "./auth/SignUp";
import { AuthProvider } from "./context/AuthContext";
import { Home } from "./Home";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { PublicRoute } from "./utils/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route path="/adminqwertyuiop/*" element={<AdminPanel />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
