import { GuardrailOptions, GuardRailResponse } from './types/guardrail';
/**
 * WalledProtect class handles interaction with Walled AI's Guardrail API.
 */
export declare class WalledProtect {
    private apiKey;
    private retries;
    private timeout;
    private count;
    /**
     * @param apiKey API key for Walled AI
     * @param retries Number of retry attempts (default 3)
     * @param timeout Request timeout in ms (default 20000 ms) in milliseconds
      */
    constructor(config: {
        apiKey: string;
        retries?: number;
        timeout?: number;
    });
    /**
   *  Guardrail options.
   * @param text : Input Text
   * @param greetingsList : Array of Greeting Style
   * @param textType : Text Type , defaults to prompt
   * @param genericSafetyCheck : Default to True
   
   * @returns A promise resolving to the API response or an error object
     */
    guardrail(options: GuardrailOptions): Promise<GuardRailResponse>;
}
