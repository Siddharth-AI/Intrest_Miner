import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./App.css";
import Dashboard from "./pages/dashboard/Dashboard";
import UserHeader from "./components/layout/UserHeader";
import Profile from "./pages/profile/Profile";
import LandingPageSections from "./pages/landing-page/LandingPageSections";
import { Footer } from "./components/layout/Footer";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { store } from "../store/store";
import { Provider } from "react-redux"; // Keep Provider here
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import GuestHeader from "./components/layout/GuestHeader";
import ProfileUpdate from "./pages/profile-update/ProfileUpdate";
import SearchHistory from "./pages/search-history/SearchHistory";

// Import your guard components
import RequireAuth from "./components/RequireAuth";
import RequireGuest from "./components/RequireGuest";
import RequireActivePlan from "./components/RequireActivePlan";

// Import modal specific components and actions
import PricingModel from "./components/PricingModel";
import { useAppDispatch, useAppSelector } from "../store/hooks"; // Use typed hooks
import { closePricingModal } from "../store/features/pricingModalSlice";
import { fetchProfileData } from "../store/features/profileSlice";

const queryClient = new QueryClient();

// Layout with Header and Footer for guests
const GuestLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <GuestHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout with Header and Footer for authenticated users
const AuthLayout = () => (
  <div className="app-scale-wrapper flex flex-col min-h-screen">
    <UserHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// AppContent handles Redux state for the modal
const AppContent = () => {
  const dispatch = useAppDispatch(); // Use typed dispatch
  const isPricingModalOpen = useAppSelector(
    (state) => state.pricingModal.isOpen
  ); // Use typed selector

  // This function will be passed to the PricingModel to close it
  const handleClosePricingModal = () => {
    dispatch(closePricingModal());
    // After closing the modal (e.g., if payment was successful or user decided not to pay yet),
    // you might want to re-fetch profile data to ensure the latest subscription status is reflected.
    // PricingModel already dispatches fetchProfileData on payment success, so this handles dismissal.
    dispatch(fetchProfileData());
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth routes with UserHeader and Footer */}
          <Route
            element={
              <RequireAuth>
                <AuthLayout />
              </RequireAuth>
            }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Protect the /permium-miner route with RequireActivePlan */}
            <Route
              path="/permium-miner"
              element={
                <RequireActivePlan>
                  <Index />
                </RequireActivePlan>
              }
            />
            <Route path="/profile-update" element={<ProfileUpdate />} />
            <Route path="/search-history" element={<SearchHistory />} />
          </Route>

          {/* Guest app routes with GuestHeader and Footer */}
          <Route
            element={
              <RequireGuest>
                <GuestLayout />
              </RequireGuest>
            }>
            <Route path="/" element={<LandingPageSections />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Catch-all NotFound route for any unmatched path */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {isPricingModalOpen && (
          <PricingModel onClose={handleClosePricingModal} />
        )}
      </BrowserRouter>
      {/* Conditionally render the PricingModel based on Redux state */}
    </>
  );
};

// Main App component wrapping with Redux Provider and QueryClientProvider
const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent /> {/* Render the main content within the provider */}
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
