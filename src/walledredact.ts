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
  private static url: string = `${basUrl}/pii/encrypt`;

  /**
   * Initialize the PII client.
   * 
   * This sets up the client with the required API key and optional configurations
   * for request retry logic and timeout behavior.
   * 
   * @param apiKey The API key obtained from Walled AI.
   * @param retries Number of retry attempts in case of request failure.
   *                If a request fails (e.g., due to a network error or server issue), the client
   *                will automatically retry the request up to the specified number of times.
   *                Defaults to 2.
   * @param timeout Maximum time (in milliseconds) to wait for a response from the server
   *                before aborting the request. Applies to both connection and read timeouts.
   *                Defaults to 20000 milliseconds (20 seconds).
   */
  constructor(apiKey: string, retries: number = 2, timeout: number = 20000) {
    this.apiKey = apiKey;
    this.retries = retries;
    this.timeout = timeout;
  }

  /**
   * Make HTTP API call
   * @param text The text to be processed
   * @returns Promise resolving to the API response
   */
  private async _httpApiCall(text: string | TextInput[]): Promise<any> {
    const url = `${basUrl}/pii/encrypt`;
    const payload = {
      text: text
    };

    const headers = {
      'Content-Type': 'application/json',
      'x-api-ey': this.apiKey
    };

    try {
      const response = await axios.post(url, payload, {
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
   * @param text The input text to evaluate. Can be a single string or a list of TextInput objects for multi-turn or structured input.
   *             TextInput format: {"role": string, "content": string}
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
  
  async guard(text: string | TextInput[]): Promise<PIIResponse> {
    let res:any
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await this._httpApiCall(text);
        res= response
      } catch (error: any) {
        console.log('Failed , error : ', error.message);
        console.log('\nRetrying ... \n');
        
        if (attempt < this.retries - 1) {
          // Sleep for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log("Reached Maximum No of retries \n");
          res= error.response.data
        }
      }
    }
    
    return res
  }
}