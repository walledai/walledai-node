import axios from 'axios';
import { PIIResponse } from './types/pii.js';
import { basUrl } from './constants.js';
 
/**
 * WalledPII class handles interaction with Walled AI's PII API.
 */
export class PII {
  private apiKey: string;
  private retries: number;
  private timeout: number;
  private count: number;

  /**
   * @param apiKey API key for Walled AI
   * @param retries Number of retry attempts (default 3)
   * @param timeout Request timeout in ms (default 20000 ms)
   */
  constructor(config: { apiKey: string; retries?: number; timeout?: number }) {
    this.apiKey = config.apiKey;
    this.retries = config?.retries || 3;
    this.timeout = config?.timeout || 20000;
    this.count = 1;
  }

  /**
   * Masks personally identifiable information in the input text
   * @param text Input text to process for PII masking
   * @returns A promise resolving to the API response with masked text and mapping
   */
  async pii(text: string): Promise<PIIResponse> {
    const url = `${basUrl}/pii/encrypt`;

    const payload = {
      text: text
    };

    try {
      const response: any = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout,
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.log("Failed to Generate Data From Walled PII..", error.message);
      console.log('\nRetrying ....\n ');
      if (this.count < this.retries) {
        this.count++;
        await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 3000) });
        return await this.pii(text);
      }
      console.log("Failed ... ");
      return { success: false,  error: error.message };
    }
  }
}

