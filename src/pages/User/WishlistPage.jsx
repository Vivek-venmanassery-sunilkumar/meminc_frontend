import React from "react";
import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader";
import Footer from "@/components/commoncomponents/Footer";
import Wishlist from "@/components/authenticateduser/Wishlist";

const WishlistPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <LoggedInUserHeader />
      <main className="flex-grow">
        <Wishlist />
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;