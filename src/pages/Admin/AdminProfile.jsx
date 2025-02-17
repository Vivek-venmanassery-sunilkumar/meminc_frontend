import LoggedInAdminHeader from "@/components/authenticatedAdmin/loggedInAdminHeader";
import AdminProfileContent from "@/components/authenticatedAdmin/profileComponents/AdminProfileContent";


export default function AdminProfile(){
    return (
        <>
            <div className="min-h-screen flex flex-col">
                <LoggedInAdminHeader/>
                <div className="flex-1 pt-20 min-h-[calc(100vh-80px)]">
                    <AdminProfileContent/>
                </div>
            </div>
        </>
    )
}