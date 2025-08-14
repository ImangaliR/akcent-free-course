import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { Verify } from "./pages/ActivatePage";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

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
