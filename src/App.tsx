import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Toaster } from "@/components/ui/sonner";

// Layouts
import MainLayout from "@/components/ui-custom/MainLayout";
import AuthLayout from "@/components/ui-custom/AuthLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InstructionsPage from "@/pages/InstructionsPage";
import InstructionDetailPage from "@/pages/InstructionDetailPage";
import NewInstructionPage from "@/pages/NewInstructionPage";
import WorkflowPage from "@/pages/WorkflowPage";
import CallbackVerificationPage from "@/pages/CallbackVerificationPage";
import AuditTrailPage from "@/pages/AuditTrailPage";
import UsersPage from "@/pages/UsersPage";
import ReportsPage from "@/pages/ReportsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ProfilePage from "@/pages/ProfilePage";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Initialize any app-wide settings
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route
            path="/instructions/new"
            element={
              <ProtectedRoute allowedRoles={["maker", "admin"]}>
                <NewInstructionPage />
              </ProtectedRoute>
            }
          />
          <Route path="/instructions/:id" element={<InstructionDetailPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route
            path="/callback-verification"
            element={
              <ProtectedRoute allowedRoles={["gis_processor", "admin"]}>
                <CallbackVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/audit-trail" element={<AuditTrailPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
