import React from "react";
import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader"; // Import the header component
import ProductDetails from "@/components/authenticateduser/productDetails"; // Import the product details component
import Footer from "@/components/commoncomponents/Footer"; // Import the footer component

export default function ProductDetailsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <LoggedInUserHeader />

      {/* Main Content - Product Details */}
      <main className="flex-grow mt-10">
        <ProductDetails />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}