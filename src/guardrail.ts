import axios from 'axios';
import { GuardrailOptions, GuardRailResponse } from './types/guardrail.js';
import { basUrl } from './constants.js';

// Allowed PII values as per Python version
const allowedPii = [
  "Person's Name",
  "Address",
  "Email Id",
  "Contact No",
  "Date Of Birth",
  "Unique Id",
  "Financial Data"
];

/**
 * WalledProtect class handles interaction with Walled AI's Guardrail API.
 */
export class WalledProtect {
  private apiKey: string;
  private retries: number;
  private timeout: number;
  private count:number;
  /**
   * @param apiKey API key for Walled AI
   * @param retries Number of retry attempts (default 3)
   * @param timeout Request timeout in ms (default 20000 ms) in milliseconds
    */
  constructor(config:{apiKey:string,retries?:number,timeout?:number}) {
    this.apiKey = config.apiKey;
    this.retries = config?.retries || 3;
    this.timeout = config?.timeout||20000;
    this.count = 1;
  }

  /**
   *  Guardrail options.
   * @param text : Input Text
   * @param greetingsList : Array of Greeting Style 
   * @param textType : Text Type , defaults to prompt
   * @param genericSafetyCheck : Default to True
   * @param complianceList : Array of compliance categories (optional)
   * @param piiList : Array of PII categories (optional, must be from allowed list)
   * @returns A promise resolving to the API response or an error object
   */
  async guardrail(options: GuardrailOptions): Promise<GuardRailResponse> {
    const url =  `${basUrl}/guardrail/moderate`;

    // Validate piiList if provided
    if (options.piiList && options.piiList.length > 0) {
      const invalid = options.piiList.filter(item => !allowedPii.includes(item));
      if (invalid.length > 0) {
        throw new Error(
          `'piiList' must be empty or contain only: ${allowedPii.join(', ')}`
        );
      }
    }

    const payload = {
      text: options.text,
      greetings_list: options.greetingsList || [],
      text_type: options.textType || 'prompt',
      generic_safety_check: options.genericSafetyCheck ?? true,
      compliance_list: options.complianceList || [],
      pii_list: options.piiList || [],
    };
    try {
        const response:any = await axios.post(url, payload, {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: this.timeout,
          });
          return {success:true,data:response.data};
    } catch (error:any) {
        console.log("Failed to Generate Data From Walled Protect..", error.message);
        console.log('\nRetrying ....\n ')
        if(this.count<this.retries)
        {
            this.count++;
            await new Promise<void>((resolve)=>{setTimeout(()=>{resolve()},3000)});
            return await this.guardrail({
              text: options.text,
              genericSafetyCheck: options.genericSafetyCheck,
              greetingsList: options.greetingsList,
              textType: options.textType,
              complianceList: options.complianceList,
              piiList: options.piiList
            })
        }
        console.log("Failed ... ")
        return {success:false,error:error.message}
    }
  }
}
