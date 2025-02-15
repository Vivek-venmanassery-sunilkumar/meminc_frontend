import { createSlice } from "@reduxjs/toolkit";

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
    user: null,
    role: null,
    first_name: null,
    last_name: null,
}
const authSlice = createSlice({
    name: 'auth',
    initialState : initialstate,
    reducers:{
        loginSuccess: (state,action)=>{
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.role = action.payload.role;
            state.first_name = action.payload.first_name;
            state.last_name = action.payload.last_name;

            saveStateToLocalStorage(state)
        },
        logout: (state)=>{
            state.isAuthenticated= false;
            state.user = null;
            state.role = null;
            state.first_name = null;
            state.last_name = null;
            localStorage.removeItem("authState")
        }
    }
});

export const {loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;