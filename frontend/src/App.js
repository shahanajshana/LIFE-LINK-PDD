import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import SplashScreen from "./components/SplashScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DonateBlood from "./pages/DonateBlood";
import FindBlood from "./pages/FindBlood";
import DonorList from "./pages/DonorList";
import Emergency from "./pages/Emergency";
import EmergencyHistory from "./pages/EmergencyHistory";
import Hospital from "./pages/Hospital";
import ManageHospitals from "./pages/ManageHospitals";
import DonationHistory from "./pages/DonationHistory";
import Notifications from "./pages/Notifications";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import RequestBlood from "./pages/RequestBlood";
import RequestStatus from "./pages/RequestStatus";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Step 1: LifeLink Slogan & Showcase Splash Screen */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/welcome" element={<SplashScreen />} />

        {/* Authentication (Login & Register) */}
        <Route path="/auth" element={<Auth />} />

        {/* Authenticated Dashboard Layout Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donate-blood"
          element={
            <ProtectedRoute>
              <Layout>
                <DonateBlood />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-blood"
          element={
            <ProtectedRoute>
              <Layout>
                <FindBlood />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor-list"
          element={
            <ProtectedRoute>
              <Layout>
                <DonorList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-donor"
          element={
            <ProtectedRoute>
              <Layout>
                <DonorList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Layout>
                <Emergency />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency-history"
          element={
            <ProtectedRoute>
              <Layout>
                <EmergencyHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospitals"
          element={
            <ProtectedRoute>
              <Layout>
                <Hospital />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-hospitals"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageHospitals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/blood-bank" element={<Navigate to="/find-blood" replace />} />
        <Route path="/my-requests" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/donation-history"
          element={
            <ProtectedRoute>
              <Layout>
                <DonationHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <AIAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/request-blood"
          element={
            <ProtectedRoute>
              <Layout>
                <RequestBlood />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-status"
          element={
            <ProtectedRoute>
              <Layout>
                <RequestStatus />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;