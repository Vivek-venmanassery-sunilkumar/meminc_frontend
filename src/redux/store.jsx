import { configureStore } from "@reduxjs/toolkit";
import otpValidationSlice from './OtpValidation'
import authReducer from './AuthSlice'
import adminAuthReducer from './AdminAuthSlice'
import vendorAuthReducer from './VendorAuthSlice'

const store = configureStore({
    reducer:{
        otpValidation: otpValidationSlice,
        auth: authReducer,
        adminAuth: adminAuthReducer,
        VendorAuth: vendorAuthReducer
    }
})

export default store;