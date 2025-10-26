import type { ClinicalMetrics } from "@/components/ClinicalMetricsForm";
const metaEnv = (import.meta as unknown as {
  env?: Record<string, string | undefined>;
}).env;

const API_BASE_URL = (metaEnv?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000");

const CSV_ENDPOINT = `${API_BASE_URL}/predict/csv`;
const IMAGE_ENDPOINT = `${API_BASE_URL}/predict/image`;

export interface ClinicalMetrics {
  "M/F": string;
  Age: string;
  EDUC: string;
  SES: string;
  MMSE: string;
  eTIV: string;
  nWBV: string;
  ASF: string;
}

export interface ClinicalMetricsPayload {
  gender: ClinicalMetrics["M/F"];
  age: number;
  educ: number;
  ses: number;
  mmse: number;
  etiv: number;
  nwbv: number;
  asf: number;
}

export interface CsvApiResponse {
  prediction: string;
  probabilities: {
    NonDemented: number;
    Demented: number;
  };
  details?: Record<string, unknown>;
}

export interface CnnApiResponse {
  prediction: string;
  probabilities: {
    NonDemented: number;
    VeryMildDemented: number;
    MildDemented: number;
    ModerateDemented: number;
  };
  details?: Record<string, unknown>;
  imagePreview?: string;
}

function assertCsvPredictionPayload(
  data: unknown
): asserts data is CsvApiResponse {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { prediction?: unknown }).prediction !== "string" ||
    typeof (data as { probabilities?: unknown }).probabilities !== "object" ||
    typeof (data as CsvApiResponse).probabilities.NonDemented !== "number" ||
    typeof (data as CsvApiResponse).probabilities.Demented !== "number"
  ) {
    throw new Error("Unexpected response structure from CSV prediction API");
  }
}

function assertCnnPredictionPayload(
  data: unknown
): asserts data is CnnApiResponse {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { prediction?: unknown }).prediction !== "string" ||
    typeof (data as { probabilities?: unknown }).probabilities !== "object" ||
    typeof (data as CnnApiResponse).probabilities.NonDemented !== "number" ||
    typeof (data as CnnApiResponse).probabilities.VeryMildDemented !==
      "number" ||
    typeof (data as CnnApiResponse).probabilities.MildDemented !== "number" ||
    typeof (data as CnnApiResponse).probabilities.ModerateDemented !== "number"
  ) {
    throw new Error("Unexpected response structure from CNN prediction API");
  }
}

export const postCsvPrediction = async (
  payload: ClinicalMetricsPayload
): Promise<CsvApiResponse> => {
  const response = await fetch(CSV_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CSV prediction request failed: ${response.status} ${response.statusText} ${errorText}`
    );
  }

  const data = await response.json();
  assertCsvPredictionPayload(data);
  return data;
};

export const postCnnPrediction = async (
  imageFile: File
): Promise<CnnApiResponse> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(IMAGE_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CNN prediction request failed: ${response.status} ${response.statusText} ${errorText}`
    );
  }

  const data = await response.json();
  assertCnnPredictionPayload(data);
  return data;
};
