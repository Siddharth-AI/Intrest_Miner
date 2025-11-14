import type { AppDispatch } from '../../store/store';
import { clearAllData } from '../../store/features/facebookAdsSlice';
import { logout } from '../../store/features/loginSlice';
import { resetSearchState } from "../../store/features/facebookSlice";
/**
 * 🔥 Centralized logout function
 * 
 * IMPORTANT: We DON'T clear facebookAds cache/persist
 * because we want AI analysis to persist across sessions (12 hour cache)
 */
export const performLogout = async (
  dispatch: AppDispatch,
  router: (path: string) => void,
  options?: {
    clearLocalStorage?: boolean;
    closeModal?: () => void;
  }
) => {
  try {
    console.log('🚪 Logging out user...');

    // 1. ❌ DON'T clear facebookAds cache - we want 12h persistence!
    // dispatch(clearCache('all')); // REMOVED

    // 2. Clear Facebook connection data
    dispatch(clearAllData());

    // 3. Reset search state
    dispatch(resetSearchState());

    // 4. Logout user
    dispatch(logout());

    // 5. ❌ DON'T purge ALL persist - only clear auth tokens
    // await persistor.purge(); // REMOVED

    // 6. Clear ONLY authentication tokens (NOT cache data)
    if (options?.clearLocalStorage !== false) {
      console.log('🧹 Clearing auth tokens only...');

      // Remove auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');

      // 🔥 KEEP persist:facebookAds (AI cache)
      // 🔥 KEEP persist:root (if it contains other important data)

      // Optional: Clear other non-critical data
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('temp_data');

    } else {
      // Minimal clear
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
    }

    // 7. Close modal if needed
    if (options?.closeModal) {
      options.closeModal();
    }

    // 8. Navigate to home
    console.log('✅ Logout complete (AI cache preserved), redirecting...');
    router('/');

  } catch (error) {
    console.error('❌ Logout error:', error);
    router('/');
  }
};
