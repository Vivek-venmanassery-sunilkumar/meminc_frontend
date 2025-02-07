import AccountPage from "@/components/authenticateduser/AccountPage";
import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader";
import Footer from "@/components/commoncomponents/Footer";


export default function AccountInformation(){
    return (
    <>
      <div className="flex flex-col min-h-screen">
      <LoggedInUserHeader />
      <div className="flex-grow overflow-hidden mt-20">
        <AccountPage />
      </div>
      <Footer />
    </div>
    </>
    )
}