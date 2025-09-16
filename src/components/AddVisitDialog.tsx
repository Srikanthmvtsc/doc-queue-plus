import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Patient {
  id: string;
  name: string;
  phone: string;
  medicalHistory: string;
}

interface AddVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onAddVisit: (patientId: string, reason: string) => void;
}

const AddVisitDialog = ({ open, onOpenChange, patient, onAddVisit }: AddVisitDialogProps) => {
  const [reasonForVisit, setReasonForVisit] = useState("Consulting");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patient) {
      onAddVisit(patient.id, reasonForVisit);
      setReasonForVisit("Consulting");
      onOpenChange(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Follow-up Visit</DialogTitle>
          <DialogDescription>
            Adding a new visit for existing patient
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Patient Info */}
          <div className="p-4 bg-primary-muted rounded-lg">
            <h4 className="font-medium text-primary mb-2">Patient Information</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {patient.name}</p>
              <p><span className="font-medium">ID:</span> {patient.id}</p>
              <p><span className="font-medium">Phone:</span> {patient.phone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="Enter the reason for this visit"
                className="min-h-20"
                required
              />
            </div>

            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm text-accent-foreground">
                <strong>Note:</strong> A new token will be generated and the patient will be added to the pending consultation queue.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Visit & Generate Token
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVisitDialog;