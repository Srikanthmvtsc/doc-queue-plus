import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { apiService, type DashboardStats } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatientsToday: 0,
    pendingPatients: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login");
      return;
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Make sure the backend server is running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Loading Dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening at your clinic today.
            </p>
          </div>
          <Button 
            onClick={() => navigate("/patients")} 
            size="lg"
            className="shadow-card"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Consulting
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients Today</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalPatientsToday}</div>
              <p className="text-xs text-muted-foreground">
                Patients registered today
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Patients</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingPatients}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for consultation
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                Successfully treated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/patients")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/patients?tab=pending")}
              >
                <Clock className="w-4 h-4 mr-2" />
                View Pending Patients
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/patients")}
              >
                <Users className="w-4 h-4 mr-2" />
                Patient Database
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Backend connection and system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backend API</p>
                    <p className="text-sm text-muted-foreground">Database connection</p>
                  </div>
                  <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Token System</p>
                    <p className="text-sm text-muted-foreground">Daily reset enabled</p>
                  </div>
                  <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">SQLite local storage</p>
                  </div>
                  <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;