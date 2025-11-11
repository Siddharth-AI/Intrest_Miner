import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import registrationReducer from "./features/registrationSlice";
import loginReducer from "./features/loginSlice";
import forgotPasswordReducer from "./features/forgotPasswordSlice";
import facebookReducer from "./features/facebookSlice";
import openaiReducer from "./features/openaiSlice";
import profileReducer from "./features/profileSlice";
import pricingModalReducer from './features/pricingModalSlice';
import subscriptionPlansReducer from './features/subscriptionPlansSlice';
import facebookSearchHistoryReducer from "./features/facebookSearchHistorySlice";
import aiSearchHistoryReducer from "./features/openAiSearchHistorySlice";
import billingHistoryReducer from './features/billingHistorySlice';
import razorpayReducer from './features/razorpaySlice';
import facebookAdsReducer from './features/facebookAdsSlice';
import onboardingReducer from './features/onboardingSlice';
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['openAi', 'aiSearchHistory'], // Only persist these slices
};

const rootReducer = combineReducers({
  login: loginReducer,
  registration: registrationReducer,
  forgotPassword: forgotPasswordReducer,
  profile: profileReducer,
  facebook: facebookReducer,
  openAi: openaiReducer,
  pricingModal: pricingModalReducer,
  subscriptionPlans: subscriptionPlansReducer,
  facebookSearchHistory: facebookSearchHistoryReducer,
  aiSearchHistory: aiSearchHistoryReducer,
  billingHistory: billingHistoryReducer,
  razorpay: razorpayReducer,
  facebookAds: facebookAdsReducer,
  onboarding: onboardingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
