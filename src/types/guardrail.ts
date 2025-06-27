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
      score: number;
    }[];
    compliance?: any[];
    pii?: any[];
    greetings?: {
      greeting_type: string;
      isPresent: boolean;
    }[];
  };
  error?: Error | string;
}