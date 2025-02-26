import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader";
import Footer from "@/components/commoncomponents/Footer";
import Checkout from "@/components/authenticateduser/Checkout";

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <LoggedInUserHeader />

      {/* Main Content */}
      <main className="flex-grow bg-white mt-20"> {/* Changed bg-[#F0EAD6] to bg-white */}
        <Checkout />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}