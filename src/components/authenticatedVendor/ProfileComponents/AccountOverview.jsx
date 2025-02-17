import toast from 'react-hot-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/axios/axiosInstance';
import { loginSuccessVendor } from '@/redux/VendorAuthSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function VendorAccountOverview() {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.VendorAuth);
    const [formData, setFormData] = useState({
        firstName: authState.first_name,
        lastName: authState.last_name,
        email: authState.email,
        phoneNumber: authState.phone_number,
        companyName: authState.company_name,
        streetAddress: authState.street_address,
        city: authState.city,
        state: authState.state,
        country: authState.country,
        pincode: authState.pincode,
    });
    const [profilePicture, setProfilePicture] = useState(authState.profile_picture);
    const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setTempProfilePictureUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.firstName);
        formDataToSend.append('last_name', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone_number', formData.phoneNumber);
        formDataToSend.append('company_name', formData.companyName);
        formDataToSend.append('street_address', formData.streetAddress);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('state', formData.state);
        formDataToSend.append('country', formData.country);
        formDataToSend.append('pincode', formData.pincode);
        if (tempProfilePictureUrl) {
            formDataToSend.append('profile_picture', profilePicture);
        }

        try {
            const response = await api.patch("/vendor/update-profile/", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                dispatch(loginSuccessVendor(response.data));
                toast.success("Profile updation successful");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorMessages = Object.values(error.response.data).flat();
                toast.error(errorMessages[0] || "Updation Failed");
            } else {
                toast.error("Updation Failed.");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendor Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 mb-4">
                <AvatarImage
                        src={tempProfilePictureUrl || profilePicture || '/placeholder-avatar.jpg'}
                        alt="Vendor"
                    />
                <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                
                <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label htmlFor="profilePicture" className="cursor-pointer">
                    <Button variant="outline" asChild>
                        <span>Change Picture</span>
                    </Button>
                </label>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>First Name</label>
                            <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Last Name</label>
                            <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label>Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Phone Number</label>
                        <Input type="tel" name="phoneNumber" pattern="^[1-9][0-9]{9}$" value={formData.phoneNumber} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Company Name</label>
                        <Input name="companyName" value={formData.companyName} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Street Address</label>
                        <Input name="streetAddress" value={formData.streetAddress} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label>City</label>
                            <Input name="city" value={formData.city} onChange={handleChange} />
                        </div>
                        <div>
                            <label>State</label>
                            <Input name="state" value={formData.state} onChange={handleChange} />
                        </div>
                        <div>
                            <label>Country</label>
                            <Input name="country" value={formData.country} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label>Pincode</label>
                        <Input name="pincode" value={formData.pincode} onChange={handleChange} />
                    </div>
                    <Button type="submit" className="w-full">Update Profile</Button>
                </form>
            </CardContent>
        </Card>
    );
}
