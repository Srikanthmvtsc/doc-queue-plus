import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Patient {
  name: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  address: string;
  medicalHistory: string;
  reasonForVisit: string;
}

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPatient: (patient: Patient) => void;
}

const AddPatientDialog = ({ open, onOpenChange, onAddPatient }: AddPatientDialogProps) => {
  const [formData, setFormData] = useState<Patient>({
    name: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    medicalHistory: "",
    reasonForVisit: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPatient(formData);
    setFormData({
      name: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      address: "",
      medicalHistory: "",
      reasonForVisit: "",
    });
    onOpenChange(false);
  };

  const handleChange = (field: keyof Patient, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter patient information to create a new record and generate a token.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter patient's full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter complete address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History *</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => handleChange("medicalHistory", e.target.value)}
              placeholder="Enter relevant medical history, allergies, chronic conditions, etc."
              className="min-h-20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
            <Textarea
              id="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={(e) => handleChange("reasonForVisit", e.target.value)}
              placeholder="Enter the reason for today's visit"
              className="min-h-20"
              required
            />
          </div>

          <div className="bg-primary-muted p-4 rounded-lg">
            <h4 className="font-medium text-primary mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• A unique patient ID will be generated</li>
              <li>• A token will be created for today's consultation</li>
              <li>• Patient will be added to the pending list</li>
              <li>• Token can be printed for patient reference</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Patient & Generate Token
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;