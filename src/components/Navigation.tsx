import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, LayoutDashboard, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged out successfully",
      description: "Thank you for using the Clinic Management System",
    });
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Patients",
      path: "/patients",
      icon: Users,
    },
    {
      label: "Pending",
      path: "/patients?tab=pending",
      icon: Clock,
    },
  ];

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ClinicCare</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                location.pathname === item.path || 
                (item.path.includes('?') && location.pathname + location.search === item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                location.pathname === item.path || 
                (item.path.includes('?') && location.pathname + location.search === item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex-1"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;