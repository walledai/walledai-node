import axios from 'axios';
import { GuardrailOptions, GuardRailResponse } from './types/guardrail';



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
   
   * @returns A promise resolving to the API response or an error object
     */
  async guardrail(options: GuardrailOptions): Promise<GuardRailResponse> {
    const url =  'https://idy5alt3vg.execute-api.ap-southeast-1.amazonaws.com/Development/guardrail/moderate';

    const payload = {
      text: options.text,
      greetings_list: options.greetingsList || [],
      text_type: options.textType || 'prompt',
      generic_safety_check: options.genericSafetyCheck ?? true,
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
            return await this.guardrail({text:options.text,genericSafetyCheck:options.genericSafetyCheck,greetingsList:options.greetingsList,textType:options.textType})
        }
        console.log("Failed ... ")
        return {success:false,error:error.message}
    }
  }
}
