import { configureStore } from "@reduxjs/toolkit";
import otpValidationSlice from './OtpValidation'
import authReducer from './AuthSlice'
import adminAuthReducer from './AdminAuthSlice'
import vendorAuthReducer from './VendorAuthSlice'
import productReducer from './ProductDetailsSlice'
import cartReducer from './CartSlice'

const store = configureStore({
    reducer:{
        otpValidation: otpValidationSlice,
        auth: authReducer,
        adminAuth: adminAuthReducer,
        VendorAuth: vendorAuthReducer,
        product: productReducer,
        cart: cartReducer
    }
})

export default store;