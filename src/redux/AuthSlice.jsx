import { createSlice } from "@reduxjs/toolkit";
import { BASE_URL } from "@/axios/axiosInstance";
const loadStateFromLocalStorage = () => {
    try {
      const serializedState = localStorage.getItem("authState");
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      return undefined;
    }
  };
  
  // Helper function to save state to localStorage
  const saveStateToLocalStorage = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem("authState", serializedState);
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  };
  
const initialstate = loadStateFromLocalStorage() || {
    isAuthenticated: false,
    email: null,
    role: null,
    first_name: null,
    last_name: null,
    phone_number: null,
    profile_picture: null,
}
const authSlice = createSlice({
    name: 'auth',
    initialState : initialstate,
    reducers:{
        loginSuccess: (state,action)=>{
            state.isAuthenticated = true;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.first_name = action.payload.first_name;
            state.last_name = action.payload.last_name;
            state.phone_number = action.payload.phone_number;
            if (action.payload.profile_picture) {
                state.profile_picture = action.payload.profile_picture;
            } else {
                state.profile_picture = null; // or a default avatar URL
            };
            saveStateToLocalStorage(state)
        },
        logout: (state)=>{
            state.isAuthenticated= false;
            state.email = null;
            state.role = null;
            state.first_name = null;
            state.last_name = null;
            state.phone_number =null;
            state.profile_picture = null;
            localStorage.removeItem("authState")
        }
    }
});

export const {loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;