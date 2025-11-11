import { Route } from "react-router-dom";
import Miner from "@/pages/miner/Miner";
import Profile from "@/pages/profile/Profile";
// import RequireActivePlan from "@/components/guards/RequireActivePlan";
import ProfileUpdate from "@/pages/profile-update/ProfileUpdate";
import SearchHistory from "@/pages/search-history/SearchHistory";
import Index from "@/pages/Index";
import BillingHistory from "@/pages/billing-history/BillingHistory";
import Dashboard from "@/pages/dashboard/Dashboard";
import MetaCampaign from "@/pages/meta-campaign/MetaCampaign";
import AnalyticsPage from "@/pages/analytics-page/AnalyticsPage";
import AdvanceAnalyticsPage from "@/pages/advance-analytics-page/AdvanceAnalyticsPage";
const AuthRoutes = () => {
  return (
    <>
      <Route path="/miner" element={<Miner />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/permium-miner" element={<Index />} />
      <Route path="/profile-update" element={<ProfileUpdate />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meta-campaign" element={<MetaCampaign />} />
      <Route path="/search-history" element={<SearchHistory />} />
      <Route path="/billing-history" element={<BillingHistory />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/advance-analytics" element={<AdvanceAnalyticsPage />} />
    </>
  );
};

export default AuthRoutes;
