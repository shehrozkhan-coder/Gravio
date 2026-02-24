import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import mongoose from "mongoose";

interface IGrocery {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  unit: string;
  quantity: number;
  image: string;
  createAt?: Date;
  updatedAt?: Date;
}

interface ICartSlice {
  cartData: IGrocery[];
}

const initialState: ICartSlice = {
  cartData: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<IGrocery>) => {
      const existingItem = state.cartData.find(
        (item) => item._id?.toString() === action.payload._id?.toString()
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        if (existingItem.quantity <= 0) {
          state.cartData = state.cartData.filter(
            (item) => item._id?.toString() !== action.payload._id?.toString()
          );
        }
      } else {
        state.cartData.push(action.payload);
      }
    },

    // ✅ clearCart added
    clearCart: (state) => {
      state.cartData = [];
    },
  },
});

export const { addToCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;