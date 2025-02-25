// GoogleAuth.js
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import api from '@/axios/axiosInstance'; // Your Axios instance
import { loginSuccess } from '@/redux/AuthSlice'; // Import the loginSuccess action
import toast from 'react-hot-toast';


const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

import { useNavigate } from 'react-router-dom';

const GoogleAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Hook for navigation

    const handleSuccess = (response) => {
        console.log(response);
        api.post('http://localhost:8000/register/google/', {
            token: response.credential,
        })
        .then((res) => {
            console.log(res.data);

            dispatch(loginSuccess({
                email: res.data.email,
                role: res.data.role,
                first_name: res.data.first_name,
                last_name: res.data.last_name,
                phone_number: res.data.phone_number,
                profile_picture: res.data.profile_picture,
            }));

            // Use navigate to redirect based on role
            if (res.data.role === 'customer') {
                navigate('/customer');
            } else if (res.data.role === 'vendor') {
                navigate('/vendor/account-overview');
            }
        })
        .catch((err) => {
            if (err.response) {
                // Backend responded with an error
                let errorMessage = err.response.data.error || "An unknown error occurred";
                console.log(errorMessage)
            } else if (err.request) {
                // No response was received (network error)
                errorMessage = "No response from server. Please try again.";
            } else {
                // Other errors (like request config issues)
                errorMessage = "Something went wrong!";
            }
           toast.error(errorMessage)
        });
    };

    const handleFailure = (error) => {
        console.error(error);
    };

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleFailure}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuth;