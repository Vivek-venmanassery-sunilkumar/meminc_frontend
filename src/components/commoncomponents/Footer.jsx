

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-[#F0EAD6] py-8 font-gentium">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About Us Section */}
        <div>
          <h3 className="font-bold mb-4 text-[#F0EAD6]">About Us</h3>
          <p>We are committed to providing the freshest meats and seafood to our customers.</p>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-bold mb-4 text-[#F0EAD6]">Contact</h3>
          <p>123 Meat Street, Foodville</p>
          <p>Phone: (123) 456-7890</p>
          <p>Email: info@meatmarket.com</p>
        </div>

        {/* Customer Service Section */}
        <div>
          <h3 className="font-bold mb-4 text-[#F0EAD6]">Customer Service</h3>
          <ul>
            <li>
              <a href="#" className="hover:text-[#D4AF37]">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D4AF37]">
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D4AF37]">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D4AF37]">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div>
          <h3 className="font-bold mb-4 text-[#F0EAD6]">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#D4AF37]">
              <Facebook />
            </a>
            <a href="#" className="hover:text-[#D4AF37]">
              <Twitter />
            </a>
            <a href="#" className="hover:text-[#D4AF37]">
              <Instagram />
            </a>
            <a href="#" className="hover:text-[#D4AF37]">
              <Linkedin />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
