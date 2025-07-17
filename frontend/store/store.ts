import { configureStore } from "@reduxjs/toolkit";
import registrationReducer from "./features/registrationSlice";
import loginReducer from "./features/loginSlice";
import forgotPasswordReducer from "./features/forgotPasswordSlice";
import facebookSearchReducer from "./features/facebookSlice";
import profileReducer from "./features/profileSlice"; // Import the new profile reducer
import searchHistoryReducer from "./features/facebookSearchHistorySlice"; // Import the new search history reducer
import openaiReducer from "./features/openaiSlice"; // Adjust path as needed
import searchHistoryAiReducer from "./features/openAiSearchHistorySlice";
import pricingModalReducer from './features/pricingModalSlice'; // Import the new slice

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
    facebookSearch: facebookSearchReducer,
    profile: profileReducer, // Add the profile reducer
    searchHistory: searchHistoryReducer, // Add the search history reducer
    searchHistoryAi: searchHistoryAiReducer,
    openai: openaiReducer,
    pricingModal: pricingModalReducer,

  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;