import { configureStore } from "@reduxjs/toolkit";
import otpValidationSlice from './OtpValidation'
import authReducer from './AuthSlice'
import adminAuthReducer from './AdminAuthSlice'

const store = configureStore({
    reducer:{
        otpValidation: otpValidationSlice,
        auth: authReducer,
        adminAuth: adminAuthReducer,
    }
})

export default store;