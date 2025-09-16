import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials
    if (username === "admin" && password === "clinic123") {
      localStorage.setItem("isAuthenticated", "true");
      toast({
        title: "Login Successful",
        description: "Welcome to the Clinic Management System",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-elevated">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Clinic Management System
          </h1>
          <p className="text-muted-foreground">
            Streamlined healthcare management
          </p>
        </div>

        <Card className="shadow-card gradient-card">
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>
              Enter your credentials to access the clinic dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-primary-muted rounded-lg">
              <p className="text-sm text-primary font-medium">Demo Credentials:</p>
              <p className="text-sm text-muted-foreground">Username: admin</p>
              <p className="text-sm text-muted-foreground">Password: clinic123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;