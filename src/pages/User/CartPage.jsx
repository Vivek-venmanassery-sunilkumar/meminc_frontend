import React from "react";
import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader";
import Footer from "@/components/commoncomponents/Footer";
import Cart from "@/components/authenticateduser/Cart";

const CartPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <LoggedInUserHeader />
      <main className="flex-grow">
        <Cart />
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;