import { configureStore } from "@reduxjs/toolkit";
import otpValidationSlice from './OtpValidation'

const store = configureStore({
    reducer:{
        otpValidation: otpValidationSlice,
    }
})

export default store;