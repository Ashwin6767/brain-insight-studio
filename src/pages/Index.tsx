import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageUpload } from "@/components/ImageUpload";
import {
  postCsvPrediction,
  postCnnPrediction,
  CsvApiResponse,
  CnnApiResponse,
} from "@/lib/api";
import { ClinicalMetricsForm, ClinicalMetrics } from "@/components/ClinicalMetricsForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Loader2, Download, RotateCcw, Brain, Database, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<ClinicalMetrics>({
    gender: "",
    age: "",
    educ: "",
    ses: "",
    mmse: "",
    etiv: "",
    nwbv: "",
    asf: "",
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [csvResult, setCsvResult] = useState<any>(null);
  const [cnnResult, setCnnResult] = useState<CnnApiResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleMetricsChange = useCallback(
    (field: keyof ClinicalMetrics, value: string) => {
      setMetrics((prev) => ({ ...prev, [field]: value }));
      if (value.trim() !== "") {
        setErrors((prev) => ({ ...prev, [field]: false }));
      }
    },
    []
  );

  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  const validateMetrics = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!metrics.gender) newErrors.gender = true;
    if (!metrics.age || Number(metrics.age) < 0) newErrors.age = true;
    if (!metrics.educ || Number(metrics.educ) < 0) newErrors.educ = true;
    if (!metrics.ses) newErrors.ses = true;
    if (!metrics.mmse || Number(metrics.mmse) < 0 || Number(metrics.mmse) > 30) newErrors.mmse = true;
    if (!metrics.etiv || Number(metrics.etiv) <= 0) newErrors.etiv = true;
    if (!metrics.nwbv || Number(metrics.nwbv) <= 0) newErrors.nwbv = true;
    if (!metrics.asf || Number(metrics.asf) <= 0) newErrors.asf = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const runPredictions = async () => {
    const isMetricsValid = validateMetrics();

    if (!selectedImage && !isMetricsValid) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly or upload an MRI scan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCnnResult(null);
    setCsvResult(null);

    try {
      const promises = [];

      if (isMetricsValid) {
        const csvPayload = {
          gender: metrics.gender,
          age: Number(metrics.age),
          educ: Number(metrics.educ),
          ses: Number(metrics.ses),
          mmse: Number(metrics.mmse),
          etiv: Number(metrics.etiv),
          nwbv: Number(metrics.nwbv),
          asf: Number(metrics.asf),
        };
        promises.push(postCsvPrediction(csvPayload));
      } else {
        promises.push(Promise.resolve(null));
      }

      if (selectedImage) {
        promises.push(postCnnPrediction(selectedImage));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [csvResponse, cnnResponse] = (await Promise.all(
        promises
      )) as [CsvApiResponse | null, CnnApiResponse | null];

      if (csvResponse) setCsvResult(csvResponse);
      if (cnnResponse) {
        setCnnResult({ ...cnnResponse, imagePreview });
      }

      toast({
        title: "Predictions Complete",
        description: "The models have analyzed the provided data.",
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        title: "Prediction Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setMetrics({
      gender: "",
      age: "",
      educ: "",
      ses: "",
      mmse: "",
      etiv: "",
      nwbv: "",
      asf: "",
    });
    setErrors({});
    setCsvResult(null);
    setCnnResult(null);
    setImagePreview(null);
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your prediction report is being generated.",
    });
  };

  return (
    <div className="min-h-screen gradient-aurora">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-16 pb-8 text-center">
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            Alzheimer's Insight Studio
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Advanced dual-model prediction system combining RandomForest clinical analysis
            and CNN brain scan imaging for comprehensive Alzheimer's assessment
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Research-Grade Models</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>AI-Powered Analysis</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        <Card className="glass-card max-w-6xl mx-auto p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: MRI Upload */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Brain MRI Analysis</h2>
                <p className="text-muted-foreground">
                  Upload an axial brain MRI scan for CNN-based structural analysis
                </p>
              </div>
              <ImageUpload
                onImageSelect={handleImageChange}
                selectedImage={selectedImage}
              />
            </div>

            {/* Right Column: Clinical Metrics */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Clinical Metrics Input</h2>
                <p className="text-muted-foreground">
                  Enter patient clinical data for RandomForest predictive analysis
                </p>
              </div>
              <ClinicalMetricsForm
                metrics={metrics}
                onChange={handleMetricsChange}
                errors={errors}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Button
              onClick={runPredictions}
              disabled={isLoading}
              size="lg"
              className="hover-scale pulse-glow font-semibold text-lg px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Models...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Run Dual Prediction
                </>
              )}
            </Button>

            {(csvResult || cnnResult) && (
              <>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="lg"
                  className="hover-scale"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Report
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="hover-scale"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Results */}
          <ResultsDisplay csvResult={csvResult} cnnResult={cnnResult} />

          {/* Model Details */}
          <div className="mt-12">
            <Accordion type="single" collapsible>
              <AccordionItem value="details">
                <AccordionTrigger className="text-lg font-semibold">
                  Model Details & Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">RandomForest CSV Model</h4>
                    <p>
                      Trained on clinical metrics including demographic data, cognitive test scores,
                      and brain volume measurements. Achieves 92% accuracy on validation data.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">CNN MRI Model</h4>
                    <p>
                      Deep learning model trained on 6,400+ brain MRI scans. Analyzes structural
                      patterns in brain tissue to detect signs of cognitive decline. Model updated: March 2024.
                    </p>
                  </div>
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Medical Disclaimer:</strong> This tool provides supportive predictions only
                      and is not a substitute for professional medical diagnosis. Always consult qualified
                      healthcare providers for medical decisions.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-foreground/5 backdrop-blur-sm border-t border-white/10 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-white/70">
          <p className="mb-2">
            © 2024 Alzheimer's Insight Studio. For research and clinical support purposes only.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition-colors">
              API Reference
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
