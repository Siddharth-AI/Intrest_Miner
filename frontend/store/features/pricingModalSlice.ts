// src/slice/pricingModalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PricingModalState {
  isOpen: boolean;
}

const initialState: PricingModalState = {
  isOpen: false,
};

const pricingModalSlice = createSlice({
  name: 'pricingModal',
  initialState,
  reducers: {
    openPricingModal: (state) => {
      state.isOpen = true;
    },
    closePricingModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openPricingModal, closePricingModal } = pricingModalSlice.actions;
export default pricingModalSlice.reducer;