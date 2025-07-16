import { configureStore } from "@reduxjs/toolkit";
import registrationReducer from "./features/registrationSlice";
import loginReducer from "./features/loginSlice";
import forgotPasswordReducer from "./features/forgotPasswordSlice";
import facebookSearchReducer from "./features/facebookSearchSlice";

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
    facebookSearch: facebookSearchReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;