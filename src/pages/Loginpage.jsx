import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Logo from "@/components/landingpagecomponents/logo"
import {Link} from 'react-router-dom'

const LoginPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
  }

  return (
    <div className="min-h-screen bg-[#4A5859] flex background-filter backdrop-blur-md items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex overflow-hidden">
        <div className="w-1/2 bg-[#4A5859] p-12 flex items-center justify-center">
          <Logo />
        </div>
        <div className="w-1/2 p-12">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#4A5859]">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-[#4A5859]">
                        Username
                    </label>
                    <Input
                        id="username"
                        placeholder="Enter your username"
                        className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
                    />
                    </div>
                    <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-[#4A5859]">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
                    />
                    </div>
                    <Button type="submit" className="w-full bg-[#4A5859] text-[#F0EAD6] hover:bg-[#3A4849]">
                    Log In
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <span className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link to='/Register'>Register</Link>
                    </span>
               </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full border-[#4A5859] text-[#4A5859] hover:bg-[#F0EAD6]">
                  Sign up with Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage