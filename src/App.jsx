import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Verify } from "./auth/ActivatePage";
import { Login } from "./auth/Login";
import { SignUp } from "./auth/SignUp";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { PublicRoute } from "./utils/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { Home } from "./Home";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Публичные маршруты - доступны только неавторизованным */}
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

          {/* Верификация доступна всем (но обычно используется после регистрации) */}
          <Route path="/verify" element={<Verify />} />

          {/* Защищенные маршруты - только для авторизованных */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Редирект по умолчанию */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
