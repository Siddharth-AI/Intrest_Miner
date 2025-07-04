import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm";
import "./App.css";
import Dashboard from "./pages/dashboard/Dashboard";
import RegisterForm from "./components/RegisterForm";
import Header from "./components/layout/Header";
import Profile from "./pages/profile/Profile";
import LandingPageSections from "./pages/landing-page/LandingPageSections";
import { Footer } from "./components/layout/Footer";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { store } from "../store/store";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

// Layout with Header and Footer
const MainLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout without Header and Footer (for auth pages)
const AuthLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <Header />
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
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/permium-miner" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Main app routes with header/footer */}
            <Route element={<MainLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<LandingPageSections />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
