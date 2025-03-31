import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from "../commoncomponents/logo"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-[#4A5859] py-2 font-gentium fixed w-full z-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/5 flex items-center justify-between lg:justify-start mb-4 lg:mb-0">
          <Logo />
          {isMobile && (
            <Button variant="ghost" onClick={toggleMobileMenu} className="text-white lg:hidden">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
        <div className={`w-full lg:w-4/5 flex flex-col ${isMobile && !isMobileMenuOpen ? 'hidden' : 'flex'}`}>
          <div className="flex items-center justify-end space-x-2 mb-2 p-2">
            <Button variant="outline" className="bg-[#F0EAD6] text-[#4A5859] hover:bg-[#E6DCC8] text-sm lg:text-base">
              <Link to="/register">Register</Link>  
            </Button>
            <Button variant="outline" className="bg-[#D4AF37] text-[#4A5859] hover:bg-[#C4A137] text-sm lg:text-base">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}