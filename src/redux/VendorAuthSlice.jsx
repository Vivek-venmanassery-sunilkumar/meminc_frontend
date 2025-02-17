import { createSlice } from "@reduxjs/toolkit";
const loadStateFromLocalStorage = () => {
    try {
      const serializedState = localStorage.getItem("vendorauthState");
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
      localStorage.setItem("vendorauthState", serializedState);
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
    company_name: null,
    street_address: null,
    city: null,
    state: null,
    country:null,
    pincode: null,
}
const vendorAuthSlice = createSlice({
    name: 'VendorAuth',
    initialState : initialstate,
    reducers:{
        loginSuccessVendor: (state,action)=>{
            state.isAuthenticated = true;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.first_name = action.payload.first_name;
            state.last_name = action.payload.last_name;
            state.phone_number = action.payload.phone_number;
            state.company_name = action.payload.company_name;
            state.street_address = action.payload.street_address;
            state.city = action.payload.city;
            state.state = action.payload.state;
            state.country = action.payload.country;
            state.pincode = action.payload.pincode;
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
            state.company_name = null;
            state.street_address = null;
            state.city = null;
            state.state = null;
            state.country = null;
            state.pincode = null;
            localStorage.removeItem("vendorauthState")
        }
    }
});


export const {loginSuccessVendor, logout} = vendorAuthSlice.actions;
export default vendorAuthSlice.reducer;