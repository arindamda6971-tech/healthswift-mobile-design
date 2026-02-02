import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Image,
  FileText,
  X,
  Sparkles,
  Clock,
  FlaskConical,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileLayout from "@/components/layout/MobileLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePrescriptionStorage } from "@/hooks/usePrescriptionStorage";

interface RecommendedTest {
  id: string;
  name: string;
  shortName?: string;
  category?: string;
  price: number;
  originalPrice: number;
  discount: string;
  reportTime: string;
}

interface AIAnalysisResult {
  tests: Array<{
    name: string;
    shortName?: string;
    category?: string;
  }>;
  confidence: string;
  notes?: string;
}

// Test pricing based on category
const getTestPricing = (category?: string) => {
  const pricingMap: Record<string, { price: number; originalPrice: number; reportTime: string }> = {
    "Blood": { price: 299, originalPrice: 499, reportTime: "6 hours" },
    "Thyroid": { price: 399, originalPrice: 699, reportTime: "24 hours" },
    "Liver": { price: 449, originalPrice: 799, reportTime: "12 hours" },
    "Kidney": { price: 499, originalPrice: 899, reportTime: "12 hours" },
    "Diabetes": { price: 199, originalPrice: 349, reportTime: "4 hours" },
    "Heart": { price: 599, originalPrice: 999, reportTime: "24 hours" },
    "Vitamin": { price: 549, originalPrice: 899, reportTime: "24 hours" },
    "Urine": { price: 149, originalPrice: 249, reportTime: "6 hours" },
    "Imaging": { price: 999, originalPrice: 1499, reportTime: "48 hours" },
    "Other": { price: 399, originalPrice: 699, reportTime: "24 hours" },
  };
  return pricingMap[category || "Other"] || pricingMap["Other"];
};

const UploadPrescriptionScreen = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { prescription, isLoading: isPrescriptionLoading, savePrescription, updateAnalysisResult, deletePrescription } = usePrescriptionStorage();
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [recommendedTests, setRecommendedTests] = useState<RecommendedTest[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState<string>("");
  const [confidence, setConfidence] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Load saved prescription on mount
  useEffect(() => {
    if (prescription && !isPrescriptionLoading) {
      setUploadedImage(prescription.image_url);
      
      if (prescription.analysis_result) {
        const result = prescription.analysis_result as AIAnalysisResult;
        if (result.tests && result.tests.length > 0) {
          const tests: RecommendedTest[] = result.tests.map((test, index) => {
            const pricing = getTestPricing(test.category);
            const discount = Math.round(((pricing.originalPrice - pricing.price) / pricing.originalPrice) * 100);
            
            return {
              id: `ai-${index}-${Date.now()}`,
              name: test.name,
              shortName: test.shortName,
              category: test.category,
              price: pricing.price,
              originalPrice: pricing.originalPrice,
              discount: `${discount}%`,
              reportTime: pricing.reportTime,
            };
          });
          setRecommendedTests(tests);
          setAnalysisNotes(result.notes || "");
          setConfidence(result.confidence);
          setAnalysisComplete(true);
        }
      }
    }
  }, [prescription, isPrescriptionLoading]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setUploadedImage(base64Image);
        setAnalysisComplete(false);
        setRecommendedTests([]);
        setAnalysisNotes("");
        setConfidence("");
        
        // Save to Supabase
        setIsUploading(true);
        const savedUrl = await savePrescription(base64Image);
        if (savedUrl) {
          setUploadedImage(savedUrl);
          toast.success("Prescription uploaded successfully!");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzePrescription = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // If uploadedImage is a URL, fetch and convert to base64
      let imageBase64 = uploadedImage;
      if (uploadedImage.startsWith("http")) {
        try {
          const response = await fetch(uploadedImage);
          const blob = await response.blob();
          imageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.error("Error fetching image:", fetchErr);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-prescription', {
        body: { imageBase64 }
      });

      if (error) {
        if (import.meta.env.DEV) console.error("Error analyzing prescription:", error);
        toast.error("Failed to analyze prescription. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      const result = data as AIAnalysisResult;
      
      if (!result.tests || result.tests.length === 0) {
        toast.error(result.notes || "No tests found in the prescription. Please upload a clearer image.");
        setAnalysisNotes(result.notes || "");
        setIsAnalyzing(false);
        return;
      }

      // Convert AI response to recommended tests with pricing
      const tests: RecommendedTest[] = result.tests.map((test, index) => {
        const pricing = getTestPricing(test.category);
        const discount = Math.round(((pricing.originalPrice - pricing.price) / pricing.originalPrice) * 100);
        
        return {
          id: `ai-${index}-${Date.now()}`,
          name: test.name,
          shortName: test.shortName,
          category: test.category,
          price: pricing.price,
          originalPrice: pricing.originalPrice,
          discount: `${discount}%`,
          reportTime: pricing.reportTime,
        };
      });

      setRecommendedTests(tests);
      setAnalysisNotes(result.notes || "");
      setConfidence(result.confidence);
      setAnalysisComplete(true);
      
      // Save analysis result to Supabase
      await updateAnalysisResult(result);
      
      toast.success(`Found ${tests.length} test${tests.length > 1 ? 's' : ''} in your prescription!`);
      
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to analyze prescription. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = async () => {
    await deletePrescription();
    setUploadedImage(null);
    setAnalysisComplete(false);
    setRecommendedTests([]);
  };

  const handleBookTest = (test: RecommendedTest) => {
    navigate(`/test/select/${test.id}`, { 
      state: { 
        test: {
          id: test.id,
          name: test.name,
          price: test.price,
          original_price: test.originalPrice,
          discount_percent: parseInt(test.discount),
          report_time_hours: parseInt(test.reportTime),
        }
      } 
    });
  };

  const handleBookAll = () => {
    toast.success("All tests added to cart!");
    navigate("/cart");
  };

  if (isPrescriptionLoading) {
    return (
      <MobileLayout showNav={false} showFloatingAdd={false}>
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false} showFloatingAdd={false}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Upload Prescription</h1>
            <p className="text-xs text-muted-foreground">Get AI-powered test recommendations</p>
          </div>
        </div>
      </motion.header>

      <div className="px-4 py-6 space-y-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!uploadedImage ? (
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/30">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Upload your prescription</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Take a photo or upload an image of your prescription
              </p>
              
              <div className="flex gap-3 justify-center">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Image className="w-4 h-4" />
                  Gallery
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded prescription"
                className="w-full rounded-2xl object-cover max-h-64"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>
                  <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
                </div>
              )}
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center"
                disabled={isUploading}
              >
                <X className="w-4 h-4 text-destructive-foreground" />
              </button>
              
              {!analysisComplete && !isUploading && (
                <div className="mt-4">
                  <Button
                    className="w-full gap-2"
                    onClick={handleAnalyzePrescription}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Prescription
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Analysis Status */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="soft-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                  </motion.div>
                </div>
                <div>
                  <p className="font-medium text-foreground">AI is analyzing your prescription</p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Complete */}
        <AnimatePresence>
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="soft-card p-4 border-success/30 bg-success/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">Analysis Complete</p>
                    {confidence && (
                      <Badge 
                        variant={confidence === "high" ? "softSuccess" : confidence === "medium" ? "softWarning" : "softDestructive"}
                        className="text-xs"
                      >
                        {confidence} confidence
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Found {recommendedTests.length} recommended test{recommendedTests.length !== 1 ? 's' : ''}
                  </p>
                  {analysisNotes && (
                    <p className="text-xs text-muted-foreground mt-1">{analysisNotes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommended Tests */}
        <AnimatePresence>
          {recommendedTests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Recommended Tests</h2>
                <Badge variant="ai">AI Suggested</Badge>
              </div>
              
              <div className="space-y-3">
                {recommendedTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="soft-card p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="softSuccess" className="text-xs">
                            {test.discount} OFF
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{test.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Reports in {test.reportTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-lg">₹{test.price}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{test.originalPrice}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleBookTest(test)}
                        className="gap-1"
                      >
                        Book
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Book All Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Button className="w-full gap-2" size="lg" onClick={handleBookAll}>
                  <FlaskConical className="w-5 h-5" />
                  Book All Tests
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        {!uploadedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="soft-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-warning" />
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Tips for best results</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure good lighting when taking a photo</li>
                  <li>• Keep the prescription flat and fully visible</li>
                  <li>• Make sure text is clear and readable</li>
                  <li>• Avoid blurry or cropped images</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
};

export default UploadPrescriptionScreen;
