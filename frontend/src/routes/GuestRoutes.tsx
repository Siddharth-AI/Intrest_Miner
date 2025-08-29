import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/login/Login";
import Register from "@/pages/register/Register";
import ForgotPassword from "@/pages/forgot-password/ForgotPassword";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/privacy-policy/PrivacyPolicy";
import TermsAndConditions from "@/pages/terms_&_Conditions/TermsAndConditions";
import DataDeletion from "@/pages/data-deletion/DataDeletion";
import DataDeletionCallback from "@/pages/data-deletion-callback/DataDeletionCallback";

const GuestRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsAndConditions />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      <Route
        path="/data-deletion-callback"
        element={<DataDeletionCallback />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default GuestRoutes;
