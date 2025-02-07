import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState:{
        isAuthenticated: false,
        user: null,
        role: null,
        first_name: null,
        last_name: null,
    },
    reducers:{
        loginSuccess: (state,action)=>{
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.first_name = action.payload.first_name;
            state.last_name = action.payload.last_name;
        },
        logout: (state)=>{
            state.isAuthenticated= false;
            state.user = null;
            state.role = null;
            state.first_name = null;
            state.last_name = null;
        }
    }
});

export const {loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;