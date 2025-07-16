import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";
import "./App.css";
import Dashboard from "./pages/dashboard/Dashboard";
import RegisterForm from "./components/RegisterForm";
import UserHeader from "./components/layout/UserHeader";
import Profile from "./pages/profile/Profile";
import LandingPageSections from "./pages/landing-page/LandingPageSections";
import { Footer } from "./components/layout/Footer";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { store } from "../store/store";
import { Provider } from "react-redux";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import GuestHeader from "./components/layout/GuestHeader";

const queryClient = new QueryClient();

// Auth guard component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Guest guard component
const RequireGuest = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Layout with Header and Footer
const GuestLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <GuestHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout without Header and Footer (for auth pages)
const AuthLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <UserHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes without header/footer */}
            <Route element={<RequireAuth><AuthLayout /></RequireAuth>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/permium-miner" element={<Index />} />
            </Route>

            {/* Guest app routes with header/footer */}
            <Route element={<RequireGuest><GuestLayout /></RequireGuest>}>
              <Route path="/" element={<LandingPageSections />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Catch-all NotFound route for any unmatched path */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
