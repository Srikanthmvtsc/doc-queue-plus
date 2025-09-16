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

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address: string;
  medicalHistory: string;
  lastVisit?: string;
  status: "active" | "pending" | "completed";
  tokenNumber?: number;
  reasonForVisit?: string;
  consultationFee?: number;
  issueTime?: string;
  completionTime?: string;
}

const Patients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "P001",
      name: "John Smith",
      dateOfBirth: "1985-05-15",
      phone: "555-0123",
      email: "john.smith@email.com",
      address: "123 Main St, City",
      medicalHistory: "Hypertension, Diabetes",
      status: "completed",
      lastVisit: "2024-01-15",
      consultationFee: 150,
      completionTime: "10:30 AM"
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      dateOfBirth: "1990-08-22",
      phone: "555-0456",
      email: "sarah.j@email.com",
      address: "456 Oak Ave, City",
      medicalHistory: "Allergies (Peanuts)",
      status: "pending",
      tokenNumber: 3,
      reasonForVisit: "Regular checkup",
      issueTime: "11:15 AM"
    },
    {
      id: "P003",
      name: "Mike Davis",
      dateOfBirth: "1978-03-10",
      phone: "555-0789",
      address: "789 Pine Rd, City",
      medicalHistory: "No significant history",
      status: "pending",
      tokenNumber: 4,
      reasonForVisit: "Consultation",
      issueTime: "11:45 AM"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/login");
    }
  }, [navigate]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    if (activeTab === "pending") return matchesSearch && patient.status === "pending";
    if (activeTab === "completed") return matchesSearch && patient.status === "completed";
    return matchesSearch;
  });

  const handleAddPatient = (newPatient: Omit<Patient, "id" | "status">) => {
    const patientId = `P${String(patients.length + 1).padStart(3, "0")}`;
    const tokenNumber = patients.filter(p => 
      p.status === "pending" && 
      new Date(p.lastVisit || "").toDateString() === new Date().toDateString()
    ).length + 1;
    
    const patient: Patient = {
      ...newPatient,
      id: patientId,
      status: "pending",
      tokenNumber,
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setPatients([...patients, patient]);
    toast({
      title: "Patient Added Successfully",
      description: `Token #${tokenNumber} generated for ${newPatient.name}`,
    });
  };

  const handleAddVisit = (patientId: string, reason: string) => {
    const tokenNumber = patients.filter(p => 
      p.status === "pending" && 
      new Date(p.lastVisit || "").toDateString() === new Date().toDateString()
    ).length + 1;
    
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { 
            ...patient, 
            status: "pending", 
            reasonForVisit: reason,
            tokenNumber,
            issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : patient
    ));
    
    const patient = patients.find(p => p.id === patientId);
    toast({
      title: "Visit Added Successfully",
      description: `Token #${tokenNumber} generated for ${patient?.name}`,
    });
  };

  const handleCompleteConsultation = (patientId: string, fee: number) => {
    setPatients(patients.map(patient => 
      patient.id === patientId 
        ? { 
            ...patient, 
            status: "completed",
            consultationFee: fee,
            completionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        : patient
    ));
    
    const patient = patients.find(p => p.id === patientId);
    toast({
      title: "Consultation Completed",
      description: `${patient?.name}'s consultation marked as complete`,
    });
  };

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
  onCompleteConsultation: (patientId: string, fee: number) => void;
}

const PatientGrid = ({ patients, onAddVisit, onCompleteConsultation }: PatientGridProps) => {
  const [completingPatient, setCompletingPatient] = useState<string | null>(null);
  const [consultationFee, setConsultationFee] = useState("");

  const handleComplete = (patientId: string) => {
    const fee = parseFloat(consultationFee);
    if (fee > 0) {
      onCompleteConsultation(patientId, fee);
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
                variant={
                  patient.status === "completed"
                    ? "default"
                    : patient.status === "pending"
                    ? "secondary"
                    : "outline"
                }
                className={
                  patient.status === "completed"
                    ? "bg-success text-success-foreground"
                    : patient.status === "pending"
                    ? "bg-warning text-warning-foreground"
                    : ""
                }
              >
                {patient.status === "pending" && patient.tokenNumber && `Token #${patient.tokenNumber}`}
                {patient.status === "completed" && "Completed"}
                {patient.status === "active" && "Active"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
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

            {patient.reasonForVisit && (
              <div className="p-3 bg-primary-muted rounded-lg">
                <p className="text-sm font-medium text-primary">Reason for Visit:</p>
                <p className="text-sm">{patient.reasonForVisit}</p>
              </div>
            )}

            {patient.issueTime && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Token issued: {patient.issueTime}</span>
              </div>
            )}

            {patient.completionTime && (
              <div className="text-sm text-success font-medium">
                Completed: {patient.completionTime} | Fee: ${patient.consultationFee}
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
                        onClick={() => handleComplete(patient.id)}
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