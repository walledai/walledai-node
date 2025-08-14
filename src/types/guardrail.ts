// Existing types - keeping your structure
export type AllowedPii =
  | "Person's Name"
  | "Address"
  | "Email Id"
  | "Contact No"
  | "Date Of Birth"
  | "Unique Id"
  | "Financial Data";

export interface GuardrailOptions {
  text: string;
  greetingsList?: string[];
  textType?: string;
  genericSafetyCheck?: boolean;
  complianceList?: string[];
  piiList?: AllowedPii[];
}

export interface GuardRailResponse {
  success: boolean;
  data?: {
    safety?: {
      safety: string;
      isSafe: boolean;
      score: number | null;
      method?: string;
      processing_time?: number;
      models_used?: string[];
    }[];
    compliance?: ComplianceItem[];
    pii?: PiiItem[];
    greetings?: GreetingItem[];
  };
  error?: Error | string;
}

// New types for guard and eval methods
export interface TextInput {
  role: string;
  content: string;
}

// Type aliases for consistency with Python implementation
export type PiiType = AllowedPii;

export type GreetingType = 
  | "Casual & Friendly"
  | "Professional & Polite";

export const PII_ENUM: Record<PiiType, PiiType> = {
  "Person's Name": "Person's Name",
  "Address": "Address",
  "Email Id": "Email Id", 
  "Contact No": "Contact No",
  "Date Of Birth": "Date Of Birth",
  "Unique Id": "Unique Id",
  "Financial Data": "Financial Data"
};

export const GREETINGS_ENUM: Record<GreetingType, GreetingType> = {
  "Casual & Friendly": "Casual & Friendly",
  "Professional & Polite": "Professional & Polite"
};

// Guard method options - extends existing but allows TextInput array
export interface GuardOptions {
  text: string | TextInput[];
  greetingsList?: string[];
  genericSafetyCheck?: boolean;
  complianceList?: string[];
  piiList?: PiiType[];
}

// Eval method options
export interface EvalOptions {
  groundTruthFilePath: string;
  modelOutputFilePath: string;
  metricsOutputFilePath: string;
  concurrencyLimit?: number;
}

// CSV row structure for evaluation
export interface CsvRow {
  test_input: string;
  compliance_topic: string;
  compliance_isOnTopic: string;
  [key: string]: string; // For dynamic PII and greeting columns
}

// Parsed response structure for eval method
export interface ParsedResponse {
  compliance_isOnTopic: string;
  pii_results: Record<string, string>;
  greetings_results: Record<string, string>;
  isSafe: string;
}

// API response item structures
export interface PiiItem {
  pii_type: string;
  isPresent: boolean;
  error: string | null;
}

export interface ComplianceItem {
  topic: string;
  isOnTopic: boolean;
  error: string | null;
}

export interface GreetingItem {
  greeting_type: string;
  isPresent: boolean;
  error: string | null;
}

// Extended safety interface to match your response structure
export interface SafetyItem {
  safety: string;
  isSafe: boolean;
  score: number | null;
  method?: string;
  processing_time?: number;
  models_used?: string[];
}