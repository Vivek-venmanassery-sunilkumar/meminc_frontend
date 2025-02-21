import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage if available
const loadState = () => {
    const savedState = localStorage.getItem('product');
    return savedState ? JSON.parse(savedState) : {
        id: '',
        name: '',
        description: '',
        category: '',
        variants: [],
        images: []
    };
};

const initialState = loadState();

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProductDetails: (state, action) => {
            const updatedState = { ...state, ...action.payload };
            localStorage.setItem('product', JSON.stringify(updatedState)); // Save to localStorage
            return updatedState;
        },
        clearProductDetails: () => {
            localStorage.removeItem('product'); // Remove from localStorage on reset
            return {
                id: '',
                name: '',
                description: '',
                category: '',
                variants: [],
                images: []
            };
        }
    }
});

export const { setProductDetails, clearProductDetails } = productSlice.actions;
export default productSlice.reducer;
