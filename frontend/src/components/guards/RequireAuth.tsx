import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"; // Use typed hooks
import { fetchProfileData } from "../../../store/features/profileSlice";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const dispatch = useAppDispatch(); // Use typed dispatch
  const {
    data: userProfile,
    loading,
    error,
  } = useAppSelector((state) => state.profile); // Use typed selector

  useEffect(() => {
    // If authenticated but profile data is not loaded, fetch it.
    if (token && !userProfile && !loading && !error) {
      dispatch(fetchProfileData());
    }
  }, [token, userProfile, loading, error, dispatch]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading && !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        Loading user profile...
      </div>
    );
  }

  // If there's an error fetching profile data, you might want to handle it
  // e.g., redirect to login or show a generic error message.
  if (error && !userProfile) {
    console.error("Error fetching user profile:", error);
    // return <Navigate to="/login" replace />; // Or display an error to the user
  }

  return children;
};

export default RequireAuth;
