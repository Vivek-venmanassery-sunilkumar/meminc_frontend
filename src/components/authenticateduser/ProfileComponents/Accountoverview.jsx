// import toast from 'react-hot-toast'
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import api from '@/axios/axiosInstance';
// import { loginSuccess } from '@/redux/AuthSlice';
// import { useDispatch,useSelector } from 'react-redux';


// export default function AccountOverview() {

//   const dispatch = useDispatch()
//   const authState = useSelector((state)=>state.auth);
//   const [formData, setFormData] = useState({
//     firstName: authState.first_name,
//     lastName: authState.last_name,
//     email: authState.email,
//     phoneNumber: authState.phone_number,
//   });
//   const [profilePicture, setProfilePicture] = useState(authState.profile_picture); // State for the profile picture file
//   const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState(null);
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfilePicture(file);
//       setTempProfilePictureUrl(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formDataToSend = new FormData();
//     formDataToSend.append('first_name', formData.firstName);
//     formDataToSend.append('last_name', formData.lastName);
//     formDataToSend.append('email', formData.email);
//     formDataToSend.append('phone_number', formData.phoneNumber);
//     if (tempProfilePictureUrl) {
//       formDataToSend.append('profile_picture', profilePicture);
//     }
//     console.log(formDataToSend)
//     try{
//       const response = await api.patch("/customer/update-profile/", formDataToSend, {
//         headers:{
//             'Content-Type':'multipart/form-data'
//         }
//       })
//       if(response.status === 200){
//         console.log(response.data)
//         dispatch(loginSuccess({
//             role:response.data.role,
//             first_name: response.data.first_name,
//             last_name: response.data.last_name,
//             email: response.data.email,
//             phone_number: response.data.phone_number,
//             profile_picture: response.data.profile_picture,
//             }))
//         toast.success("Profile updation successfull")
//       }
//     }catch(error){
//       if(error.response && error.response.data){
//         const errorMessages = Object.values(error.response.data).flat();
//         toast.error(errorMessages[0] || "Updation Failed");
//       }else{
//         toast.error("Updation Failed.");
//       }
//     }
//   }


//   return (
//     <Card>
//     <CardHeader>
//       <CardTitle>Account Overview</CardTitle>
//     </CardHeader>
//     <CardContent>
//       <div className="flex flex-col items-center mb-6">
//         <Avatar className="w-24 h-24 mb-4">
//           <AvatarImage
//             src={tempProfilePictureUrl || profilePicture || '/placeholder-avatar.jpg'}
//             alt="User"
//           />
//           <AvatarFallback>UN</AvatarFallback>
//         </Avatar>
//         <input
//           type="file"
//           id="profilePicture"
//           accept="image/*"
//           onChange={handleFileChange}
//           className="hidden"
//         />
//         <label htmlFor="profilePicture" className="cursor-pointer">
//           <Button variant="outline" asChild>
//             <span>Change Picture</span>
//           </Button>
//         </label>
//       </div>
//       <form className="space-y-4" onSubmit={handleSubmit}>
//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             name="firstName"
//             placeholder="First Name"
//             value={formData.firstName}
//             onChange={handleChange}
//           />
//           <Input
//             name="lastName"
//             placeholder="Last Name"
//             value={formData.lastName}
//             onChange={handleChange}
//           />
//         </div>
//         <Input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//         />
//         <Input
//           type="tel"
//           name="phoneNumber"
//           pattern="^[1-9][0-9]{9}$"
//           placeholder="Phone Number"
//           value={formData.phoneNumber}
//           onChange={handleChange}
//         />
//         <Button type="submit" className="w-full">
//           Update Profile
//         </Button>
//       </form>
//     </CardContent>
//   </Card>
//   );
// }


import toast from 'react-hot-toast'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/axios/axiosInstance';
import { loginSuccess } from '@/redux/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function AccountOverview() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    firstName: authState.first_name,
    lastName: authState.last_name,
    email: authState.email,
    phoneNumber: authState.phone_number,
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
    if (tempProfilePictureUrl) {
      formDataToSend.append('profile_picture', profilePicture);
    }

    try {
      const response = await api.patch("/customer/update-profile/", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        dispatch(loginSuccess({
          role: response.data.role,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          phone_number: response.data.phone_number,
          profile_picture: response.data.profile_picture,
        }));
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
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage
              src={tempProfilePictureUrl || profilePicture || '/placeholder-avatar.jpg'}
              alt="User"
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
              <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
            <Input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              pattern="^[1-9][0-9]{9}$"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
