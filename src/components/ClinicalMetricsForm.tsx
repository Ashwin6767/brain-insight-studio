import React from "react";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Plus, Minus } from "lucide-react";

export interface ClinicalMetrics {
  gender: "M" | "F" | "";
  age: string;
  educ: string;
  ses: string;
  mmse: string;
  etiv: string;
  nwbv: string;
  asf: string;
}

interface ClinicalMetricsFormProps {
  metrics: ClinicalMetrics;
  onChange: (field: keyof ClinicalMetrics, value: string) => void;
  errors: Record<string, boolean>;
}

interface FormFieldProps {
  label: string;
  field: keyof ClinicalMetrics;
  tooltip: string;
  placeholder?: string;
  type?: string;
  children?: React.ReactNode;
  value: string;
  error: boolean;
  onChange: (value: string) => void;
  step?: number;
}

const FormField = React.memo(
  ({
    label,
    field,
    tooltip,
    placeholder,
    type = "text",
    children,
    value,
    error,
    onChange,
    step,
  }: FormFieldProps) => {
    const handleStep = (direction: "inc" | "dec") => {
      const currentValue = parseFloat(value) || 0;
      const stepValue = step || 1;
      const newValue =
        direction === "inc"
          ? currentValue + stepValue
          : currentValue - stepValue;

      // Handle floating point inaccuracies for decimal steps
      if (step && step < 1) {
        const precision = step.toString().split(".")[1]?.length || 2;
        onChange(newValue.toFixed(precision));
      } else {
        onChange(String(Math.round(newValue)));
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field} className="font-semibold">
            {label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                role="button"
                aria-label={`${label} info`}
                className="inline-flex"
                tabIndex={-1}
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
              </span>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs z-50 bg-card border border-border"
              side="top"
            >
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {children ||
          (type === "number" ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleStep("dec")}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id={field}
                type="text" // Use text to allow decimal points and avoid browser spinners
                inputMode={step && step < 1 ? "decimal" : "numeric"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`transition-all text-center ${
                  error ? "border-danger shake" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleStep("inc")}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Input
              id={field}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`transition-all ${error ? "shake" : ""}`}
            />
          ))}
      </div>
    );
  }
);

export const ClinicalMetricsForm = ({
  metrics,
  onChange,
  errors,
}: ClinicalMetricsFormProps) => {
  const handleChange = React.useCallback(
    (field: keyof ClinicalMetrics, value: string) => {
      onChange(field, value);
    },
    [onChange]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="gender" className="font-semibold">
                Gender
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    aria-label="Gender info"
                    className="inline-flex"
                    tabIndex={-1}
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs z-50 bg-card border border-border"
                  side="top"
                >
                  <p className="text-sm">
                    Biological sex at birth affects brain structure and
                    Alzheimer's risk patterns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={metrics.gender === "M" ? "default" : "outline"}
                onClick={() => handleChange("gender", "M")}
                className={`flex-1 ${errors.gender ? "shake" : ""}`}
              >
                Male
              </Button>
              <Button
                type="button"
                variant={metrics.gender === "F" ? "default" : "outline"}
                onClick={() => handleChange("gender", "F")}
                className={`flex-1 ${errors.gender ? "shake" : ""}`}
              >
                Female
              </Button>
            </div>
          </div>

          <FormField
            label="Age (years)"
            field="age"
            tooltip="Age is a significant risk factor. Alzheimer's prevalence increases with age, especially after 65."
            placeholder="e.g., 72"
            type="number"
            value={metrics.age}
            error={!!errors.age}
            onChange={(value) => handleChange("age", value)}
          />

          <FormField
            label="Education (years)"
            field="educ"
            tooltip="Years of formal education. Higher education is associated with cognitive reserve and may delay symptoms."
            placeholder="e.g., 16"
            type="number"
            value={metrics.educ}
            error={!!errors.educ}
            onChange={(value) => handleChange("educ", value)}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="ses" className="font-semibold">
                SES (1-5)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    role="button"
                    aria-label="SES (1-5) info"
                    className="inline-flex"
                    tabIndex={-1}
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs z-50 bg-card border border-border"
                  side="top"
                >
                  <p className="text-sm">
                    Socioeconomic status scale from 1 (highest) to 5 (lowest).
                    Affects healthcare access and lifestyle factors.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={metrics.ses}
              onValueChange={(value) => handleChange("ses", value)}
            >
              <SelectTrigger
                className={errors.ses ? "border-danger shake" : ""}
              >
                <SelectValue placeholder="Select SES" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Highest</SelectItem>
                <SelectItem value="2">2 - High</SelectItem>
                <SelectItem value="3">3 - Middle</SelectItem>
                <SelectItem value="4">4 - Low</SelectItem>
                <SelectItem value="5">5 - Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            label="MMSE (0-30)"
            field="mmse"
            tooltip="Mini-Mental State Examination score. Cognitive function test where 24-30 is normal, lower scores indicate impairment."
            placeholder="e.g., 27"
            type="number"
            value={metrics.mmse}
            error={!!errors.mmse}
            onChange={(value) => handleChange("mmse", value)}
          />

          <FormField
            label="eTIV (mm³)"
            field="etiv"
            tooltip="Estimated Total Intracranial Volume. Reflects overall brain size, typically 1000-2000 mm³."
            placeholder="e.g., 1450"
            type="number"
            value={metrics.etiv}
            error={!!errors.etiv}
            onChange={(value) => handleChange("etiv", value)}
          />

          <FormField
            label="nWBV (ratio)"
            field="nwbv"
            tooltip="Normalized Whole Brain Volume. Brain tissue volume ratio, typically 0.65-0.85. Lower values may indicate atrophy."
            placeholder="e.g., 0.75"
            type="number"
            step={0.01}
            value={metrics.nwbv}
            error={!!errors.nwbv}
            onChange={(value) => handleChange("nwbv", value)}
          />

          <FormField
            label="ASF (ratio)"
            field="asf"
            tooltip="Atlas Scaling Factor. Normalization measure for brain size, typically 0.9-1.6."
            placeholder="e.g., 1.2"
            type="number"
            step={0.01}
            value={metrics.asf}
            error={!!errors.asf}
            onChange={(value) => handleChange("asf", value)}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
