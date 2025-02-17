import { createSlice } from '@reduxjs/toolkit'

const loadStateFromLocalStorage = () => {
    try {
      const serializedState = localStorage.getItem("adminauthState");
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
      localStorage.setItem("adminauthState", serializedState);
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  };
const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState: loadStateFromLocalStorage() || {
        isAuthenticated: false,
        role : null,
    },
    reducers: {
        loginSuccessAdmin:(state, action)=>{
            state.isAuthenticated = true;
            state.role = action.payload.role;

            saveStateToLocalStorage(state)
        },
        logout:(state)=>{
            state.isAuthenticated = false;
            state.role = null;
            state.user = null;

            localStorage.removeItem("adminauthState")
        } 
    }
});


export const { loginSuccessAdmin, logout} = adminAuthSlice.actions;
export default adminAuthSlice.reducer; 