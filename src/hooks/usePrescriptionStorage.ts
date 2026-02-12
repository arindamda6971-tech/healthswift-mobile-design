import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PrescriptionData {
  id: string;
  image_url: string;
  status: string;
  analysis_result: any;
  created_at: string;
}

export const usePrescriptionStorage = () => {
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load pending prescription from Supabase
  const loadPrescription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_prescriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading prescription:", error);
      } else if (data) {
        setPrescription({
          id: data.id,
          image_url: data.image_url,
          status: data.status || "pending",
          analysis_result: data.analysis_result,
          created_at: data.created_at,
        });
      }
    } catch (err) {
      console.error("Error loading prescription:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Upload and save prescription image
  const savePrescription = useCallback(async (imageBase64: string): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to upload prescription");
      return null;
    }

    try {
      // Convert base64 to blob
      const base64Data = imageBase64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload prescription");
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("prescriptions")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Delete any existing pending prescriptions
      await supabase
        .from("user_prescriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "pending");

      // Save to database
      // Insert the prescription row. Supabase client returns a chainable builder
      // that supports `.select().single()` before awaiting, but test mocks may
      // return a plain promise/object from `insert`. Support both patterns.
      try {
        const insertCall: any = supabase.from("user_prescriptions").insert({
          user_id: user.id,
          image_url: imageUrl,
          status: "pending",
        });

        let insertResult: any;

        if (insertCall && typeof insertCall.select === "function") {
          // Typical supabase client: chain then await
          insertResult = await insertCall.select().single();
        } else {
          // Some mocks return a Promise resolving to { data, error }
          const awaited = await insertCall;
          insertResult = awaited;
        }

        const data = insertResult?.data ?? insertResult;
        const error = insertResult?.error ?? null;

        if (error) {
          console.error("Error saving prescription:", error);
          toast.error("Failed to save prescription");
          return null;
        }

        if (data) {
          setPrescription({
            id: data.id,
            image_url: data.image_url,
            status: data.status,
            analysis_result: data.analysis_result,
            created_at: data.created_at,
          });
        }
      } catch (e) {
        console.error("Error saving prescription:", e);
        toast.error("Failed to save prescription");
        return null;
      }

      return imageUrl;
    } catch (err) {
      console.error("Error saving prescription:", err);
      toast.error("Failed to save prescription");
      return null;
    }
  }, [user]);

  // Update prescription with analysis result
  const updateAnalysisResult = useCallback(async (analysisResult: any) => {
    if (!prescription || !user) return;

    try {
      const { error } = await supabase
        .from("user_prescriptions")
        .update({
          analysis_result: analysisResult,
          status: "analyzed",
        })
        .eq("id", prescription.id);

      if (error) {
        console.error("Error updating analysis:", error);
      } else {
        setPrescription((prev) =>
          prev ? { ...prev, analysis_result: analysisResult, status: "analyzed" } : null
        );
      }
    } catch (err) {
      console.error("Error updating analysis:", err);
    }
  }, [prescription, user]);

  // Delete prescription
  const deletePrescription = useCallback(async () => {
    if (!prescription || !user) return;

    try {
      await supabase
        .from("user_prescriptions")
        .delete()
        .eq("id", prescription.id);

      setPrescription(null);
    } catch (err) {
      console.error("Error deleting prescription:", err);
    }
  }, [prescription, user]);

  // Load prescription on mount
  useEffect(() => {
    loadPrescription();
  }, [loadPrescription]);

  return {
    prescription,
    isLoading,
    savePrescription,
    updateAnalysisResult,
    deletePrescription,
    loadPrescription,
  };
};
