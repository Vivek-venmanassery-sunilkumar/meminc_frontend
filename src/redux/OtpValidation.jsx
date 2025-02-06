import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    email : null
}

const otpValidationSlice = createSlice({
    name: 'otpValidation',
    initialState,
    reducers: {
        setEmailForOtp:(state,action) =>{
            state.email = action.payload
        },
        clearOtpValidation:(state)=>{
            state.email = null;
        },
    },
});

export const { setEmailForOtp, clearOtpValidation } = otpValidationSlice.actions;
export default otpValidationSlice.reducer;