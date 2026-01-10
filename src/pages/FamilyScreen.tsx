import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Droplets,
  Heart,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, differenceInYears } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type FamilyMember = Tables<"family_members">;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other"];
const relations = ["Self", "Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Other"];

const FamilyScreen = () => {
  const navigate = useNavigate();
  const { user, supabaseUserId } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    gender: "",
    date_of_birth: "",
    blood_group: "",
    phone: "",
    medical_conditions: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      relation: "",
      gender: "",
      date_of_birth: "",
      blood_group: "",
      phone: "",
      medical_conditions: "",
    });
    setEditingMember(null);
  };

  const fetchFamilyMembers = async () => {
    if (!supabaseUserId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", supabaseUserId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error("Failed to load family members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [supabaseUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUserId) {
      toast.error("Please login to add family members");
      return;
    }

    if (!formData.name || !formData.relation) {
      toast.error("Name and relation are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const memberData = {
        user_id: supabaseUserId,
        name: formData.name,
        relation: formData.relation,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        phone: formData.phone || null,
        medical_conditions: formData.medical_conditions
          ? formData.medical_conditions.split(",").map((c) => c.trim())
          : null,
        is_primary: formData.relation === "Self",
      };

      if (editingMember) {
        const { error } = await supabase
          .from("family_members")
          .update(memberData)
          .eq("id", editingMember.id);

        if (error) throw error;
        toast.success("Family member updated successfully");
      } else {
        const { error } = await supabase
          .from("family_members")
          .insert(memberData);

        if (error) throw error;
        toast.success("Family member added successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchFamilyMembers();
    } catch (error: any) {
      console.error("Error saving family member:", error);
      toast.error(error.message || "Failed to save family member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relation: member.relation,
      gender: member.gender || "",
      date_of_birth: member.date_of_birth || "",
      blood_group: member.blood_group || "",
      phone: member.phone || "",
      medical_conditions: member.medical_conditions?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberToDelete.id);

      if (error) throw error;
      toast.success("Family member removed successfully");
      fetchFamilyMembers();
    } catch (error: any) {
      console.error("Error deleting family member:", error);
      toast.error(error.message || "Failed to remove family member");
    } finally {
      setMemberToDelete(null);
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader
        title="Family Members"
        rightAction={
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="soft" size="sm">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Family Member" : "Add Family Member"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relation">Relation *</Label>
                  <Select
                    value={formData.relation}
                    onValueChange={(value) => setFormData({ ...formData, relation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {relations.map((relation) => (
                        <SelectItem key={relation} value={relation}>
                          {relation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select
                      value={formData.blood_group}
                      onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Input
                    id="conditions"
                    placeholder="e.g., Diabetes, Hypertension (comma separated)"
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {editingMember ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingMember ? "Update Member" : "Add Member"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 pb-8">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <p className="text-sm text-foreground">
            Manage health profiles for your family members. Book tests for anyone and track their health all in one place.
          </p>
        </motion.div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Family Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your family members to book tests for them
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </motion.div>
        ) : (
          /* Family members list */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 space-y-3"
          >
            {members.map((member, index) => {
              const age = calculateAge(member.date_of_birth);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="soft-card"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      member.gender === "Male" ? "bg-primary/10" : member.gender === "Female" ? "bg-pink-100" : "bg-muted"
                    }`}>
                      <User className={`w-7 h-7 ${
                        member.gender === "Male" ? "text-primary" : member.gender === "Female" ? "text-pink-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        {member.is_primary && <Badge variant="soft">Primary</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.relation}
                        {age !== null && ` • ${age} yrs`}
                        {member.gender && ` • ${member.gender}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {member.blood_group && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Droplets className="w-3 h-3" />
                            {member.blood_group}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Added: {format(new Date(member.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                      {member.medical_conditions && member.medical_conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.medical_conditions.map((condition, i) => (
                            <Badge key={i} variant="softWarning">{condition}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="soft" size="sm" className="flex-1" onClick={() => navigate("/categories")}>
                      Book Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                      <Heart className="w-4 h-4" />
                      Reports
                    </Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => handleEdit(member)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!member.is_primary && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-9 h-9 text-destructive hover:text-destructive"
                        onClick={() => setMemberToDelete(member)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Add member button at bottom */}
        {members.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Family Member
            </Button>
          </motion.div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from your family list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default FamilyScreen;
