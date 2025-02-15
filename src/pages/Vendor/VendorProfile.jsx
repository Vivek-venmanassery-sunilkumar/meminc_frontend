
import LoggedInSellerHeader from "@/components/authenticatedVendor/loggedInVendorHeader";
import VendorProfileContent from "@/components/authenticatedVendor/ProfileComponents/vendorProfileContent";


export default function VendorProfile(){
    return (
        <>
            <div className="min-h-screen flex flex-col">
                <LoggedInSellerHeader/>
                <div className="flex-1 pt-20 min-h-[calc(100vh-80px)]">
                    <VendorProfileContent/> 
                </div>
            </div>
        </>
    )
}