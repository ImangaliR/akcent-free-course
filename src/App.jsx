import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminPanel } from "./AdminPanel";
import { Verify } from "./auth/ActivatePage";
import { Login } from "./auth/Login";
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
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route path="/verify" element={<Verify />} />

          <Route path="/admin" element={<AdminPanel />} />
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
