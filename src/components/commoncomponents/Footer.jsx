// import { useState } from "react"
// import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export default function Footer() {
//   const [email, setEmail] = useState("")

//   const handleSubscribe = (e) => {
//     e.preventDefault()
//     console.log(`Subscribing email: ${email}`)
//     // Implement your newsletter subscription logic here
//     setEmail("")
//   }

//   return (
//     <footer className="bg-black text-white py-8 font-gentium">
//       <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//         <div>
//           <h3 className="font-bold mb-4 text-[#D4AF37]">About Us</h3>
//           <p>We are committed to providing the freshest meats and seafood to our customers.</p>
//         </div>
//         <div>
//           <h3 className="font-bold mb-4 text-[#D4AF37]">Contact</h3>
//           <p>123 Meat Street, Foodville</p>
//           <p>Phone: (123) 456-7890</p>
//           <p>Email: info@meatmarket.com</p>
//         </div>
//         <div>
//           <h3 className="font-bold mb-4 text-[#D4AF37]">Customer Service</h3>
//           <ul>
//             <li>
//               <a href="#" className="hover:text-[#F0EAD6]">
//                 FAQ
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-[#F0EAD6]">
//                 Shipping & Returns
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-[#F0EAD6]">
//                 Terms & Conditions
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-[#F0EAD6]">
//                 Privacy Policy
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div>
//           <h3 className="font-bold mb-4 text-[#D4AF37]">Newsletter</h3>
//           <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
//             <Input
//               type="email"
//               placeholder="Your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="bg-white text-black"
//             />
//             <Button type="submit" variant="outline" className="bg-[#D4AF37] text-black hover:bg-[#C4A137]">
//               Subscribe
//             </Button>
//           </form>
//           <h3 className="font-bold mt-4 mb-2 text-[#D4AF37]">Follow Us</h3>
//           <div className="flex space-x-4">
//             <a href="#" className="hover:text-[#F0EAD6]">
//               <Facebook />
//             </a>
//             <a href="#" className="hover:text-[#F0EAD6]">
//               <Twitter />
//             </a>
//             <a href="#" className="hover:text-[#F0EAD6]">
//               <Instagram />
//             </a>
//             <a href="#" className="hover:text-[#F0EAD6]">
//               <Linkedin />
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

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
