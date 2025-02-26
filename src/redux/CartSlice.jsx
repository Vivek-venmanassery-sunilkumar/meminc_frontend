import { createSlice } from "@reduxjs/toolkit";

// Helper function to load cart state from localStorage
const loadCartStateFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem("cartState");
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error("Failed to load cart state from localStorage:", error);
        return undefined;
    }
};

// Helper function to save cart state to localStorage
const saveCartStateToLocalStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("cartState", serializedState);
    } catch (error) {
        console.error("Failed to save cart state to localStorage:", error);
    }
};

// Load initial state from localStorage or use default values
const initialState = loadCartStateFromLocalStorage() || {
    user: null,
    items: [],
    totalPrice: '0.00',
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartData: (state, action) => {
            state.user = action.payload.user;
            state.items = action.payload.items;
            state.totalPrice = action.payload.total_price;
            saveCartStateToLocalStorage(state); // Save to localStorage
        },
        updateCartItem: (state, action) => {
            const { updated_item, total_price } = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.variant_id === updated_item.variant_id);

            if (existingItemIndex !== -1) {
                state.items[existingItemIndex] = updated_item;
            } else {
                state.items.push(updated_item);
            }
            state.totalPrice = total_price;
            saveCartStateToLocalStorage(state); // Save to localStorage
            console.log("Updated Redux Store:", { items: state.items, totalPrice: state.totalPrice });
        },
        clearCart: (state) => {
            state.user = null;
            state.items = [];
            state.totalPrice = '0.00';
            localStorage.removeItem("cartState"); // Clear localStorage
        },
    },
});

export const { setCartData, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;