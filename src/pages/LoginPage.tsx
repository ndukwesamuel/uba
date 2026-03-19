import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    const success = await login(email, password);

    if (success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials. Try demo accounts below.");
    }
  };

  const demoAccounts = [
    { email: "maker@client.com", role: "Client Maker", color: "bg-blue-500" },
    {
      email: "verifier@client.com",
      role: "Client Verifier",
      color: "bg-green-500",
    },
    {
      email: "authorizer@client.com",
      role: "Client Authorizer",
      color: "bg-purple-500",
    },
    {
      email: "processor@gis.com",
      role: "GIS Processor",
      color: "bg-orange-500",
    },
    { email: "admin@uba.com", role: "Admin", color: "bg-red-500" },
  ];

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4 animate-pulse">
          {/* <Building2 className="w-8 h-8 text-white" /> */}

          <img
            src="https://www.ubagroup.com/wp-content/uploads/2022/03/logo.svg"
            alt=""
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">CIS Portal</h1>
        <p className="text-white/50 text-sm">
          Client Instruction Submission - UBA
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#D92027] focus:ring-[#D92027]/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#D92027] focus:ring-[#D92027]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-[#D92027] data-[state=checked]:border-[#D92027]"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-white/60 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              className="text-sm text-[#D92027] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D92027] hover:bg-[#B51C22] text-white font-semibold py-6 transition-all duration-300 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 text-center mb-4">
            Demo Accounts (Password: "password")
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => fillCredentials(account.email)}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    account.color,
                  )}
                >
                  <span className="text-xs font-bold text-white">
                    {account.role.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {account.role}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {account.email}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-white/30 text-xs mt-6">
        © 2024 United Bank for Africa. All rights reserved.
      </p>
    </div>
  );
}
