import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchWishlistStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWishlistSuccess(state, action) {
      state.items = action.payload;
      state.loading = false;
    },
    fetchWishlistFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    removeWishlistItem(state, action) {
      state.items = state.items.filter((item) => item.variant_id !== action.payload);
    },
  },
});

export const {
  fetchWishlistStart,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  removeWishlistItem,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;