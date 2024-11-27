import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ReactNode, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Authprovider, useAuth } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import ResetPassword from "./pages/resetpassword/resetpassword";
import AdminLogin from "./admin/AdminLogin/adminLogin";
import AdminUserlist from "./admin/AdminUserlist/adminUserlist";
import ReportedPosts from "./admin/ReportedPost/reportedPost";
import "./App.css";
import Profile from "./pages/profile/profile";
import Search from "./pages/search/search";
import UserProfile from "./pages/userprofile/userprofile";
import NotificationPage from "./pages/notification/notification";
import ReportDetailsPage from "./admin/ReportTable/reportTable";
import NotFound from "./pages/error/error";
import Chat from "./pages/chat/chat";
import { SocketProvider } from "./context/socket";
import Dashboard from "./admin/AdminDashboard/admindashboard";
import Loading from "./components/loading/loading";
const queryClient = new QueryClient();

function App() {
  return (
    <Suspense fallback={<Loading loading={true} />}>
      <SocketProvider>
        <Authprovider>
          <AdminAuthProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <AuthRoute>
                        <Login />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <AuthRoute>
                        <Login />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <AuthRoute>
                        <Login />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <AuthRoute>
                        <Login />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/reset-password/:token"
                    element={
                      <AuthRoute>
                        <ResetPassword />
                      </AuthRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute>
                        <Search />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user/:userId"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notification"
                    element={
                      <ProtectedRoute>
                        <NotificationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/404" element={<NotFound />} />
                </Routes>
                <AdminRoutes />
              </Router>
            </QueryClientProvider>
          </AdminAuthProvider>
        </Authprovider>
      </SocketProvider>
    </Suspense>
  );
}

function AdminRoutes() {
  const { isAdminAuthenticated } = useAdminAuth();

  return (
    <Routes>
      <Route
        path="/adminLogin"
        element={
          !isAdminAuthenticated ? <AdminLogin /> : <Navigate to="/dashbord" />
        }
      />
      <Route
        path="/dashbord"
        element={
          isAdminAuthenticated ? <Dashboard /> : <Navigate to="/adminLogin" />
        }
      />
      <Route
        path="/userlist"
        element={
          isAdminAuthenticated ? (
            <AdminUserlist />
          ) : (
            <Navigate to="/adminLogin" />
          )
        }
      />
      <Route
        path="/reportedposts"
        element={
          isAdminAuthenticated ? (
            <ReportedPosts />
          ) : (
            <Navigate to="/adminLogin" />
          )
        }
      />
      <Route
        path="/reportdetails/:postId"
        element={
          isAdminAuthenticated ? (
            <ReportDetailsPage />
          ) : (
            <Navigate to="/adminLogin" />
          )
        }
      />
    </Routes>
  );
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  console.log("AuthRoute check:", isAuthenticated);
  return isAuthenticated ? <Navigate to="/home" /> : children;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const storedData = JSON.parse(localStorage.getItem("user_data") || "{}");

  return storedData.userToken || isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

export default App;
