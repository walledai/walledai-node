

export interface GuardrailOptions {
    text: string;
    greetingsList?: string[];
    textType?: string;
    genericSafetyCheck?: boolean;
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