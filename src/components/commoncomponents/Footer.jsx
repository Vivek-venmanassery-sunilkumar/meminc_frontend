import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-[#F0EAD6] py-8 font-gentium">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Us Section */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[#F0EAD6]">About Us</h3>
            <p className="text-sm">We are committed to providing the freshest meats and seafood to our customers.</p>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[#F0EAD6]">Contact</h3>
            <p className="text-sm">123 Meat Street, Foodville</p>
            <p className="text-sm">Phone: (123) 456-7890</p>
            <p className="text-sm">Email: meminccorporation@gmail.com</p>
          </div>

          {/* Follow Us Section */}
          <div className="md:col-span-1">
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

          {/* Empty div to balance the layout */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[#F0EAD6]">Newsletter</h3>
            <p className="text-sm">Subscribe to our newsletter for updates and special offers.</p>
            {/* You could add a newsletter signup form here */}
          </div>
        </div>
      </div>
    </footer>
  );
}