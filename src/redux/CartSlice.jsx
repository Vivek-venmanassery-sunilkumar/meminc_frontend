import {createSlice} from "@reduxjs/toolkit"


const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        user: null,
        items: [],
        totalPrice: '0.00',
    },
    reducers: {
        setCartData: (state, action)=>{
            state.user = action.payload.user;
            state.items = action.payload.items;
            state.totalPrice = action.payload.totalPrice;
        },
        updateCartItem: (state, action) => {
            const {updated_item, total_price } = action.payload;
            const existingItemIndex = state.items.findIndex(item=>item.variant_id === updated_item.variant_id);
            
            if(existingItemIndex !== -1){
                state.items[existingItemIndex] = updated_item;
            }else{
                state.items.push(updated_item);
            }
            state.totalPrice = total_price;
        },
    },
});


export const {setCartData, updateCartItem} = cartSlice.actions;
export default cartSlice.reducer;