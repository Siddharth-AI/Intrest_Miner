import { BrowserRouter, Routes, Route } from "react-router-dom";
import { closePricingModal } from "../../store/features/pricingModalSlice";
import { fetchProfileData } from "../../store/features/profileSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import RequireAuth from "./guards/RequireAuth";
import AuthLayout from "./layout/AuthLayout";
import RequireGuest from "./guards/RequireGuest";
import GuestLayout from "./layout/GuestLayout";
import NotFound from "@/pages/NotFound";
import PricingModel from "./model/PricingModel";
import AuthRoutes from "@/routes/AuthRoutes";
import GuestRoutes from "@/routes/GuestRoutes";
import PrivacyPolicy from "@/pages/privacy-policy/PrivacyPolicy";
import TermsAndConditions from "@/pages/terms_&_Conditions/TermsAndConditions";
import ForgotPassword from "@/pages/forgot-password/ForgotPassword";
import LandingPageSections from "@/pages/landing-page/LandingPageSections";
import Login from "@/pages/login/Login";
import Register from "@/pages/register/Register";
import DataDeletion from "@/pages/data-deletion/DataDeletion";
import DataDeletionCallback from "@/pages/data-deletion-callback/DataDeletionCallback";

const AppContent = () => {
  const dispatch = useAppDispatch();
  const isPricingModalOpen = useAppSelector(
    (state) => state.pricingModal.isOpen
  );
  const handleClosePricingModal = () => {
    dispatch(closePricingModal());
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
            {AuthRoutes()}
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

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route
            path="/data-deletion-callback"
            element={<DataDeletionCallback />}
          />

          {/* Catch-all NotFound route for any unmatched path */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {isPricingModalOpen && (
          <PricingModel onClose={handleClosePricingModal} />
        )}
      </BrowserRouter>
    </>
  );
};

export default AppContent;
