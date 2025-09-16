import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, User, Calendar, Phone, MapPin, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import AddPatientDialog from "@/components/AddPatientDialog";
import AddVisitDialog from "@/components/AddVisitDialog";
import { useToast } from "@/hooks/use-toast";
import { apiService, type Patient } from "@/services/api";

const Patients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login");
      return;
    }
    
    fetchPatients();
  }, [navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await apiService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients. Make sure the backend server is running on localhost:3001",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    if (activeTab === "pending") return matchesSearch && patient.status === "pending";
    if (activeTab === "completed") return matchesSearch && patient.status === "completed";
    return matchesSearch;
  });

  const handleAddPatient = async (newPatient: Omit<Patient, "id" | "status">) => {
    try {
      const patient = await apiService.createPatient({
        name: newPatient.name,
        date_of_birth: newPatient.date_of_birth,
        phone: newPatient.phone,
        email: newPatient.email,
        address: newPatient.address,
        medical_history: newPatient.medical_history,
        reason_for_visit: newPatient.reason_for_visit
      });
      
      // Create initial visit
      if (newPatient.reason_for_visit) {
        const visit = await apiService.createVisit(patient.id, newPatient.reason_for_visit);
        toast({
          title: "Patient Added Successfully",
          description: `Token #${visit.tokenNumber} generated for ${newPatient.name}`,
        });
      }
      
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Failed to add patient:', error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVisit = async (patientId: string, reason: string) => {
    try {
      const visit = await apiService.createVisit(patientId, reason);
      const patient = patients.find(p => p.id === patientId);
      
      toast({
        title: "Visit Added Successfully",
        description: `Token #${visit.tokenNumber} generated for ${patient?.name}`,
      });
      
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Failed to add visit:', error);
      toast({
        title: "Error",
        description: "Failed to add visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteConsultation = async (patient: Patient, fee: number) => {
    try {
      // Find the current visit ID - this would need to be tracked better in a real system
      // For now, we'll use a simple approach
      await apiService.completeVisit(1, fee); // This needs to be improved to get actual visit ID
      
      const patientName = patients.find(p => p.id === patient.id)?.name;
      toast({
        title: "Consultation Completed",
        description: `${patientName}'s consultation marked as complete`,
      });
      
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      toast({
        title: "Error",
        description: "Failed to complete consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Loading Patients...</h1>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Patient Management</h1>
            <p className="text-muted-foreground">
              Manage patient records, appointments, and consultations
            </p>
          </div>
          <Button 
            onClick={() => setIsAddPatientOpen(true)} 
            size="lg"
            className="shadow-card"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Patients ({patients.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({patients.filter(p => p.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({patients.filter(p => p.status === "completed").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PatientGrid 
              patients={filteredPatients} 
              onAddVisit={(patient) => {
                setSelectedPatient(patient);
                setIsAddVisitOpen(true);
              }}
              onCompleteConsultation={handleCompleteConsultation}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <PatientGrid 
              patients={filteredPatients} 
              onAddVisit={(patient) => {
                setSelectedPatient(patient);
                setIsAddVisitOpen(true);
              }}
              onCompleteConsultation={handleCompleteConsultation}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <PatientGrid 
              patients={filteredPatients} 
              onAddVisit={(patient) => {
                setSelectedPatient(patient);
                setIsAddVisitOpen(true);
              }}
              onCompleteConsultation={handleCompleteConsultation}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddPatientDialog
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        onAddPatient={handleAddPatient}
      />

      <AddVisitDialog
        open={isAddVisitOpen}
        onOpenChange={setIsAddVisitOpen}
        patient={selectedPatient}
        onAddVisit={handleAddVisit}
      />
    </div>
  );
};

interface PatientGridProps {
  patients: Patient[];
  onAddVisit: (patient: Patient) => void;
  onCompleteConsultation: (patient: Patient, fee: number) => void;
}

const PatientGrid = ({ patients, onAddVisit, onCompleteConsultation }: PatientGridProps) => {
  const [completingPatient, setCompletingPatient] = useState<string | null>(null);
  const [consultationFee, setConsultationFee] = useState("");

  const handleComplete = (patient: Patient) => {
    const fee = parseFloat(consultationFee);
    if (fee > 0) {
      onCompleteConsultation(patient, fee);
      setCompletingPatient(null);
      setConsultationFee("");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <Card key={patient.id} className="shadow-card gradient-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>{patient.name}</span>
                </CardTitle>
                <CardDescription>ID: {patient.id}</CardDescription>
              </div>
              <Badge
                variant={patient.status === "completed" ? "default" : "secondary"}
                className={
                  patient.status === "completed"
                    ? "bg-success text-success-foreground"
                    : "bg-warning text-warning-foreground"
                }
              >
                {patient.status === "pending" && patient.token_number && `Token #${patient.token_number}`}
                {patient.status === "completed" && "Completed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">📧</span>
                  <span>{patient.email}</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{patient.address}</span>
              </div>
            </div>

            {patient.reason_for_visit && (
              <div className="p-3 bg-primary-muted rounded-lg">
                <p className="text-sm font-medium text-primary">Reason for Visit:</p>
                <p className="text-sm">{patient.reason_for_visit}</p>
              </div>
            )}

            {patient.issue_time && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Token issued: {new Date(patient.issue_time).toLocaleTimeString()}</span>
              </div>
            )}

            {patient.completion_time && (
              <div className="text-sm text-success font-medium">
                Completed: {new Date(patient.completion_time).toLocaleTimeString()} | Fee: ${patient.consultation_fee}
              </div>
            )}

            <div className="flex gap-2">
              {patient.status !== "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddVisit(patient)}
                  className="flex-1"
                >
                  Add Visit
                </Button>
              )}
              
              {patient.status === "pending" && (
                <>
                  {completingPatient === patient.id ? (
                    <div className="flex gap-2 w-full">
                      <Input
                        placeholder="Fee amount"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        type="number"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComplete(patient)}
                        disabled={!consultationFee || parseFloat(consultationFee) <= 0}
                      >
                        ✓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCompletingPatient(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setCompletingPatient(patient.id)}
                      className="w-full"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Patients;