import { createSlice } from '@reduxjs/toolkit'


const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState: {
        isAuthenticated: false,
        role : null,
    },
    reducers: {
        loginSuccessAdmin:(state, action)=>{
            state.isAuthenticated = true;
            state.role = action.payload.role;
        },
        logout:(state)=>{
            state.isAuthenticated = false;
            state.role = null;
            state.user = null;
        } 
    }
});


export const { loginSuccessAdmin, logout} = adminAuthSlice.actions;
export default adminAuthSlice.reducer; 