import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface CsvPrediction {
  prediction: string;
  probabilities: {
    NonDemented: number;
    Demented: number;
  };
}

interface CnnPrediction {
  prediction: string;
  probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
  imagePreview?: string;
}

interface ResultsDisplayProps {
  csvResult: CsvPrediction | null;
  cnnResult: CnnPrediction | null;
}

export const ResultsDisplay = ({ csvResult, cnnResult }: ResultsDisplayProps) => {
  const getRiskColor = (prediction: string) => {
    if (prediction.includes("NonDemented")) return "success";
    if (prediction.includes("VeryMild")) return "warning";
    if (prediction.includes("Mild")) return "warning";
    return "danger";
  };

  const getRiskIcon = (prediction: string) => {
    if (prediction.includes("NonDemented")) return <CheckCircle className="h-6 w-6" />;
    if (prediction.includes("VeryMild")) return <AlertTriangle className="h-6 w-6" />;
    return <AlertCircle className="h-6 w-6" />;
  };

  if (!csvResult && !cnnResult) return null;

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-2xl font-bold text-center">Prediction Results</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {csvResult && (
          <Card className={`p-6 space-y-4 slide-in-up border-2 border-${getRiskColor(csvResult.prediction)}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${getRiskColor(csvResult.prediction)}/10 text-${getRiskColor(csvResult.prediction)}`}>
                {getRiskIcon(csvResult.prediction)}
              </div>
              <div>
                <h4 className="font-bold text-lg">RandomForest CSV Model</h4>
                <p className="text-sm text-muted-foreground">Clinical metrics analysis</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Prediction:</span>
                  <span className={`font-bold text-${getRiskColor(csvResult.prediction)}`}>
                    {csvResult.prediction}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Non-Demented</span>
                    <span className="font-medium">{(csvResult.probabilities.NonDemented * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={csvResult.probabilities.NonDemented * 100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Demented</span>
                    <span className="font-medium">{(csvResult.probabilities.Demented * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={csvResult.probabilities.Demented * 100} className="h-3" />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              This prediction is based on clinical metrics and cognitive test scores. It should be used as a supportive tool, not a definitive diagnosis.
            </p>
          </Card>
        )}

        {cnnResult && (
          <Card className={`p-6 space-y-4 slide-in-up border-2 border-${getRiskColor(cnnResult.prediction)}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${getRiskColor(cnnResult.prediction)}/10 text-${getRiskColor(cnnResult.prediction)}`}>
                {getRiskIcon(cnnResult.prediction)}
              </div>
              <div>
                <h4 className="font-bold text-lg">CNN MRI Model</h4>
                <p className="text-sm text-muted-foreground">Brain scan analysis</p>
              </div>
            </div>

            {cnnResult.imagePreview && (
              <img
                src={cnnResult.imagePreview}
                alt="MRI Scan"
                className="w-full h-32 object-contain rounded-lg bg-muted"
              />
            )}

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Prediction:</span>
                  <span className={`font-bold text-${getRiskColor(cnnResult.prediction)}`}>
                    {cnnResult.prediction}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(cnnResult.probabilities).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={value * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              This prediction analyzes brain MRI imagery for structural patterns. Results are supportive and should be reviewed by medical professionals.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
