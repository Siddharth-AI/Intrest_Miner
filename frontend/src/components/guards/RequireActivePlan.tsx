import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { openPricingModal } from "../../../store/features/pricingModalSlice";
import { fetchProfileData } from "../../../store/features/profileSlice";

const RequireActivePlan = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const {
    data: userProfile,
    loading,
    error,
  } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      console.log("ProtectedRoutes: No token found. Redirecting to login.");
      navigate("/login", { replace: true });
      return;
    }

    if (token && !userProfile && !loading && !error) {
      dispatch(fetchProfileData());
    }

    if (!loading && userProfile) {
      if (userProfile.subscription_status !== "active") {
        dispatch(openPricingModal());
      }
    }
  }, [userProfile, loading, error, dispatch, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        Checking plan status...
      </div>
    );
  }

  if (error) {
    console.error("Failed to load user profile or profile is missing:", error);
    dispatch(openPricingModal());
    navigate("/miner", { replace: true });
    return null;
  }

  if (!token || !userProfile) {
    console.log(
      "ProtectedRoutes: No token or user data after load/error. Redirecting to login."
    );
    navigate("/login", { replace: true });
    return null;
  }

  const subscriptionStatus = userProfile.subscription_status;
  if (subscriptionStatus === "active") {
    console.log(
      "ProtectedRoutes: Subscription is active. Granting access to premium content."
    );
    return children;
  } else {
    console.log(
      `ProtectedRoutes: Subscription status is '${subscriptionStatus}'. Redirecting to dashboard.`
    );
    dispatch(openPricingModal());
    navigate("/miner", { replace: true });
    return null;
  }
};

export default RequireActivePlan;
