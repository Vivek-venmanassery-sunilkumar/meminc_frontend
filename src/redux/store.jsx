import { configureStore } from "@reduxjs/toolkit";
import otpValidationSlice from './OtpValidation'
import authReducer from './AuthSlice'


const store = configureStore({
    reducer:{
        otpValidation: otpValidationSlice,
        auth: authReducer,
    }
})

export default store;