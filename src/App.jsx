import { Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import Create from "./pages/Create";
import Activity from "./pages/Activity";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Feed />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* CREATE */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Create />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* SEARCH */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Search />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ACTIVITY */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Activity />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Messages />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* MY PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* OTHER USER */}
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* EDIT PROFILE */}
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>

  );
}

