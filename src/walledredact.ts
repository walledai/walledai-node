import axios from 'axios';
import { PIIResponse ,TextInput } from './types/pii.js';
import { basUrl } from './constants.js';

// Import TextInput type (assuming it exists in types folder)
/*
interface TextInput {
  role: string;
  content: string;
}
*/

/**
 * WalledRedact class handles interaction with Walled AI's PII API for redaction/encryption.
 */
export class WalledRedact {
  private apiKey: string;
  private retries: number;
  private timeout: number;
  private static count: number = 1;
  private url: string;

  /**
   * Initialize the PII client.
   * 
   * This sets up the client with the required API key and optional configurations
   * for request retry logic and timeout behavior.
   * 
   * @param config Object containing apiKey, retries, timeout
   *        { apiKey: string, retries?: number, timeout?: number }
   */
  constructor(config: { apiKey: string, retries?: number, timeout?: number }) {
    this.apiKey = config.apiKey;
    this.retries = config?.retries || 2;
    this.timeout = config?.timeout || 20000;
    this.url = `${basUrl}/walled-redact`;
  }

  /**
   * Make HTTP API call
   * @param text The text to be processed
   * @returns Promise resolving to the API response
   */
  private async _httpApiCall(text: string | TextInput[]): Promise<any> {
    const payload = {
      text: text
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };

    try {
      const response = await axios.post(this.url, payload, {
        headers,
        timeout: this.timeout,
      });

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Runs PII detection on the given input text to identify and format personal identifiable information.
   * 
   * This method sends a request to the Walled AI API and returns a structured response
   * containing PII formatted data.
   * 
   * @param options Object with a 'text' field: { text: string | TextInput[] }
   * @returns Promise resolving to PIIResponse object containing the evaluation results, including PII detection and formatting.
   * 
   * If the request fails, a dictionary is returned with:
   * - `success` (bool): Always false
   * - `error` (string): The error message explaining the failure
   * 
   * Notes:
   * - The method will retry on failure up to the number of retries configured in the client.
   * - If all retries fail, the final response will contain an error message instead of throwing an exception.
   */
  async guard(options: { text: string | TextInput[] }): Promise<PIIResponse> {
    let res: any;
    const { text } = options;
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this._httpApiCall(text);
        res = response;
      } catch (error: any) {
        console.log('Failed , error : ', error.message);
        console.log('\nRetrying ... \n');
        
        if (attempt < this.retries - 1) {
          // Sleep for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log("Reached Maximum No of retries \n");
          res = error.response.data;
        }
      }
    }
    return res;
  }
}