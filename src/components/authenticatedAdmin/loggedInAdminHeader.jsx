import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"
import Logo from "../commoncomponents/logo"
import {Link} from 'react-router-dom'


export default function LoggedInAdminHeader() {
  return (
    <header className="bg-[#4A5859] py-2 font-gentium fixed w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center">
          <Button variant="ghost" className="text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <Link to={'admin/account-overview'}>
          <Button variant="ghost" className="text-white">
                  <User className="h-5 w-5" />
          </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

