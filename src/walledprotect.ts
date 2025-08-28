import axios from 'axios';
import * as fs from 'fs';
import { stringify } from 'csv-stringify';
import { 
  GuardrailOptions, 
  GuardRailResponse, 
  GuardOptions,
  EvalOptions,
  CsvRow,
  ParsedResponse,
  PiiType,
  GreetingType,
  PII_ENUM,
  GREETINGS_ENUM,
  AllowedPii,
  TextInput,
  PiiItem,
  ComplianceItem
} from './types/guardrail.js';
import { basUrl } from './constants.js';

// Allowed PII 
const allowedPii: AllowedPii[] = [
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
  private count: number;
  private url: string;

  /**
   * Simple sleep utility to delay execution
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @param apiKey API key for Walled AI
   * @param retries Number of retry attempts (default 3)
   * @param timeout Request timeout in ms (default 20000 ms) in milliseconds
   */
  constructor(config: { apiKey: string, retries?: number, timeout?: number }) {
    this.apiKey = config.apiKey;
    this.retries = config?.retries || 3;
    this.timeout = config?.timeout || 20000;
    this.count = 1;
    this.url = `${basUrl}/walled-protect`;
  }

  /**
   * Make HTTP API call - equivalent to _http_api_call
   */
  private async httpApiCall(
    text: string | TextInput[],
    greetingsList: string[] = ["Casual & Friendly", "Professional & Polite"],
    genericSafetyCheck: boolean = true,
    complianceList: string[] = [],
    piiList: AllowedPii[] = []
  ): Promise<any> {
    const payload = {
      text,
      greetings_list: greetingsList,
      generic_safety_check: genericSafetyCheck,
      compliance_list: complianceList,
      pii_list: piiList
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey
    };

    try {
      const response = await axios.post(this.url, payload, {
        headers,
        timeout: this.timeout
      });


      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Guard method 
   */
  async guard(options: GuardOptions): Promise<GuardRailResponse> {
    const {
      text,
      greetingsList = ["Casual & Friendly"],
      genericSafetyCheck = true,
      complianceList = [],
      piiList = []
    } = options;

    // Validate PII list
    if (piiList && piiList.length > 0) {
      const invalid = piiList.filter(item => !allowedPii.includes(item));
      if (invalid.length > 0) {
        throw new Error(`'pii' must be empty or contain only: ${allowedPii.sort().join(', ')}`);
      }
    }
    let res:any;
    const runAsyncGuard = async (): Promise<GuardRailResponse> => {
      try {
        const response = await this.httpApiCall(
          text,
          greetingsList,
          genericSafetyCheck,
          complianceList,
          piiList
        );
        return response;
      } catch (error: any) {
        throw error;
      }
    };

    // Retry logic
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        res= await runAsyncGuard();
      } catch (error: any) {
        console.log('Failed, error:', error.message);
        console.log('\nRetrying...\n');
        
        if (attempt < this.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('Reached Maximum No of retries\n');
          res= error.response.data
        }
      }
    }

    return res;
  }

  /**
   * Validate CSV headers 
   */
  private validateCsvHeaders(headers: string[]): { isValid: boolean; errorMessage: string } {
    const requiredColumns = new Set(['test_input', 'compliance_topic', 'compliance_isOnTopic']);
    const optionalColumns = new Set([
      "Person's Name", "Address", "Email Id", "Contact No",
      "Date Of Birth", "Unique Id", "Financial Data",
      "Casual & Friendly", "Professional & Polite"
    ]);
    const allAllowedColumns = new Set([...requiredColumns, ...optionalColumns]);

    // Check for missing required columns
    const missingRequired = [...requiredColumns].filter(col => !headers.includes(col));
    if (missingRequired.length > 0) {
      return {
        isValid: false,
        errorMessage: `Missing required columns: ${missingRequired.sort().join(', ')}`
      };
    }

    // Check for invalid columns
    const invalidColumns = headers.filter(col => !allAllowedColumns.has(col));
    if (invalidColumns.length > 0) {
      return {
        isValid: false,
        errorMessage: `Invalid columns found: ${invalidColumns.sort().join(', ')}. Allowed columns are: ${[...allAllowedColumns].sort().join(', ')}`
      };
    }

    return { isValid: true, errorMessage: '' };
  }

  /**
   * Extract dynamic columns from CSV 
   */
  private async extractDynamicColumnsFromCsv(filePath: string): Promise<{ piiTypes: string[]; greetingTypes: string[] }> {
    console.log(`Starting to extract columns from: ${filePath}`);
    
    try {
      // Read file synchronously to avoid streaming issues
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log("File read successfully, length:", fileContent.length);
      
      // Split by lines and get the first line (headers)
      const lines = fileContent.split('\n');
      if (lines.length === 0) {
        throw new Error('Empty CSV file');
      }
      
      const headerLine = lines[0].trim();
      console.log("Header line:", headerLine);
      
      // Parse headers using csv-parse synchronously
      const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
      console.log("Parsed headers:", headers);
      
      // Validate headers
      console.log("Validating headers...");
      const validation = this.validateCsvHeaders(headers);
      console.log("Validation result:", validation);
      
      if (!validation.isValid) {
        throw new Error(`CSV validation failed: ${validation.errorMessage}`);
      }

      // Extract column names that match our PII and Greetings enums
      const piiTypes: string[] = [];
      const greetingTypes: string[] = [];

      for (const col of headers) {
        if (col in PII_ENUM) {
          piiTypes.push(col);
        } else if (col in GREETINGS_ENUM) {
          greetingTypes.push(col);
        }
      }

      console.log("Extracted PII types:", piiTypes);
      console.log("Extracted greeting types:", greetingTypes);
      
      return { piiTypes, greetingTypes };
    } catch (error) {
      console.log("Error in extractDynamicColumnsFromCsv:", error);
      throw error;
    }
  }

  /**
   * Load guardrail cases from CSV 
   */
  private async loadGuardrailCases(filePath: string): Promise<CsvRow[]> {
    console.log(`Loading guardrail cases from: ${filePath}`);
    
    try {
      // Read file synchronously
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log("File read successfully for cases, length:", fileContent.length);
      
      // Split by lines
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        throw new Error('CSV file must have at least headers and one data row');
      }
      
      // Parse headers
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());

      
      // Parse data rows
      const cases: CsvRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length === headers.length) {
          const row: CsvRow = {} as CsvRow;
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          cases.push(row);
        }
      }
      
      console.log(`Loaded ${cases.length} cases`);
      return cases;
    } catch (error) {
      console.log("Error in loadGuardrailCases:", error);
      throw error;
    }
  }

  /**
   * Parse API response 
   */
  private parseResponse(responseData: any, piiTypes: string[], greetingTypes: string[]): ParsedResponse {
    const data = responseData?.data || {};

    // Compliance
    let complianceIsOnTopic = "FALSE";
    if (data.compliance && Array.isArray(data.compliance) && data.compliance.length > 0) {
      complianceIsOnTopic = data.compliance[0].isOnTopic ? "TRUE" : "FALSE";
    }

    // Dynamic PII
    const piiResults: Record<string, string> = {};
    piiTypes.forEach(pii => {
      piiResults[pii] = "FALSE";
    });
    
    if (data.pii && Array.isArray(data.pii)) {
      data.pii.forEach((piiItem: PiiItem) => {
        if (piiItem.pii_type && piiResults.hasOwnProperty(piiItem.pii_type)) {
          piiResults[piiItem.pii_type] = piiItem.isPresent ? "TRUE" : "FALSE";
        }
      });
    }

    // Dynamic Greetings
    const greetingsResults: Record<string, string> = {};
    greetingTypes.forEach(greet => {
      greetingsResults[greet] = "FALSE";
    });
    
    if (data.greetings && Array.isArray(data.greetings)) {
      data.greetings.forEach((greeting: { greeting_type: string; isPresent: boolean }) => {
        if (greeting.greeting_type && greetingsResults.hasOwnProperty(greeting.greeting_type)) {
          greetingsResults[greeting.greeting_type] = greeting.isPresent ? "TRUE" : "FALSE";
        }
      });
    }

    // Safety - updated to match your response structure
    let safety: boolean | null = null;
    if (Array.isArray(data.safety) && data.safety.length > 0) {
      safety = data.safety[0].isSafe;
    }

    return {
      compliance_isOnTopic: complianceIsOnTopic,
      pii_results: piiResults,
      greetings_results: greetingsResults,
      isSafe: safety !== null ? (safety ? "TRUE" : "FALSE") : "FALSE"
    };
  }

  /**
   * Process a single test case 
   */
  private async processCaseHttp(row: CsvRow, piiTypes: string[], greetingTypes: string[]): Promise<string[] | null> {
    try {
      const text = row.test_input;
      const complianceList = row.compliance_topic;
      const piiList: AllowedPii[] = [];

      console.log(`Processing case: ${text.substring(0, 50)}...`);

      const response = await this.httpApiCall(
        text,
        greetingTypes,
        true,
        complianceList ? [complianceList] : [],
        piiList
      );

      console.log(`API call completed for: ${text.substring(0, 50)}...`);

      if (!response || typeof response !== 'object' || !('data' in response)) {
        console.log(`Invalid response for '${text.substring(0, 50)}...': ${response}`);
        return null;
      }

      const parsed = this.parseResponse(response, piiTypes, greetingTypes);
      const rowOut = [
        text,
        complianceList,
        parsed.compliance_isOnTopic,
      ];
      
      // Add PII results
      piiTypes.forEach(pii => {
        rowOut.push(parsed.pii_results[pii]);
      });
      
      // Add greeting results
      greetingTypes.forEach(greet => {
        rowOut.push(parsed.greetings_results[greet]);
      });
      
      // Add safety result
      rowOut.push(parsed.isSafe);
      
      console.log(`Case processed successfully: ${text.substring(0, 50)}...`);
      return rowOut;
    } catch (error: any) {
      console.log(`HTTP Error for '${row.test_input?.substring(0, 50)}...': ${error.message}`);
      return null;
    }
  }

  /**
   * Write results to CSV 
   */
  private async writeResults(filePath: string, results: string[][], piiTypes: string[], greetingTypes: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const header = ["test_input", "compliance_topic", "compliance_isOnTopic"];
      header.push(...piiTypes);
      header.push(...greetingTypes);
      header.push("isSafe");

      const stringifier = stringify({ header: true, columns: header });
      const writableStream = fs.createWriteStream(filePath);

      stringifier.on('error', reject);
      writableStream.on('error', reject);
      writableStream.on('finish', resolve);

      stringifier.pipe(writableStream);
      
      // Write header
      stringifier.write(header);
      
      // Write data rows
      results.forEach(row => {
        stringifier.write(row);
      });
      
      stringifier.end();
    });
  }

  /**
   * Calculate and write metrics 
   */
  private async writeColumnMetricsCsv(
    groundTruthPath: string,
    modelOutputPath: string,
    metricsOutputPath: string,
    piiTypes: string[],
    greetingTypes: string[]
  ): Promise<void> {
    // For simplicity, this is a basic implementation
    // In a production environment, you might want to use a proper statistics library
    
    if (!fs.existsSync(modelOutputPath)) {
      console.log(`Results file ${modelOutputPath} not found, skipping metrics calculation`);
      return;
    }

    // Load both CSV files
    const gtData = await this.loadGuardrailCases(groundTruthPath);
    const predData = await this.loadGuardrailCases(modelOutputPath);
    
    const columns = ["compliance_isOnTopic", ...piiTypes, ...greetingTypes];
    const metricsRows: string[][] = [];

    for (const col of columns) {
      if (!gtData[0]?.hasOwnProperty(col) || !predData[0]?.hasOwnProperty(col)) {
        continue;
      }

      // Simple accuracy calculation
      let correct = 0;
      let total = 0;
      let tp = 0, tn = 0, fp = 0, fn = 0;

      for (let i = 0; i < Math.min(gtData.length, predData.length); i++) {
        const yTrue = gtData[i][col]?.toString().toUpperCase();
        const yPred = predData[i][col]?.toString().toUpperCase();
        
        if (yTrue === yPred) correct++;
        total++;

        if (yTrue === 'TRUE' && yPred === 'TRUE') tp++;
        else if (yTrue === 'FALSE' && yPred === 'FALSE') tn++;
        else if (yTrue === 'FALSE' && yPred === 'TRUE') fp++;
        else if (yTrue === 'TRUE' && yPred === 'FALSE') fn++;
      }

      const accuracy = total > 0 ? correct / total : 0;
      const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

      metricsRows.push([
        col,
        accuracy.toFixed(3),
        precision.toFixed(3),
        recall.toFixed(3),
        f1.toFixed(3),
        tp.toString(),
        tn.toString(),
        fp.toString(),
        fn.toString()
      ]);
    }

    // Write metrics to CSV
    return new Promise((resolve, reject) => {
      const header = ['metrics', 'accuracy', 'precision', 'recall', 'f1', 'TP', 'TN', 'FP', 'FN'];
      const stringifier = stringify({ header: true, columns: header });
      const writableStream = fs.createWriteStream(metricsOutputPath);

      stringifier.on('error', reject);
      writableStream.on('error', reject);
      writableStream.on('finish', () => {
        console.log(`Metrics written to ${metricsOutputPath}`);
        resolve();
      });

      stringifier.pipe(writableStream);
      
      stringifier.write(header);
      metricsRows.forEach(row => {
        stringifier.write(row);
      });
      
      stringifier.end();
    });
  }

  /**
   * Eval method 
   */
  async eval(options: EvalOptions): Promise<any> {
    const {
      groundTruthFilePath,
      modelOutputFilePath,
      metricsOutputFilePath,
      concurrencyLimit = 20
    } = options;

    console.log("Eval method started with options:", { groundTruthFilePath, modelOutputFilePath, metricsOutputFilePath, concurrencyLimit });

    // Per-request delay in milliseconds to throttle API calls
    const PER_REQUEST_DELAY_MS = 3000;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1}/${this.retries}`);
        
        // Extract dynamic columns from CSV
        console.log("Extracting dynamic columns from CSV...");
        const { piiTypes, greetingTypes } = await this.extractDynamicColumnsFromCsv(groundTruthFilePath);
        console.log("Extracted columns - PII types:", piiTypes, "Greeting types:", greetingTypes);

        // Load test cases
        console.log("Loading test cases...");
        const cases = await this.loadGuardrailCases(groundTruthFilePath);
        if (!cases || cases.length === 0) {
          console.log("No test cases found in the ground truth file.");
          return { success: false, error: "No test cases found." };
        }
        console.log(`Loaded ${cases.length} test cases`);

        // Concurrency-limited workers with per-request delay
        console.log("Starting throttled concurrent HTTP processing...");
        const results: (string[] | null)[] = new Array(cases.length).fill(null);
        let currentIndex = 0;

        const worker = async (workerId: number) => {
          while (true) {
            const indexToProcess = currentIndex++;
            if (indexToProcess >= cases.length) break;

            // Throttle before each API call
            await this.sleep(PER_REQUEST_DELAY_MS);

            const row = cases[indexToProcess];
            try {
              const rowResult = await this.processCaseHttp(row, piiTypes, greetingTypes);
              results[indexToProcess] = rowResult;
            } catch (err: any) {
              console.log(`Worker ${workerId} error on index ${indexToProcess}:`, err?.message || err);
              results[indexToProcess] = null;
            }
          }
        };

        const numWorkers = Math.max(1, Math.min(concurrencyLimit, cases.length));
        const workers: Promise<void>[] = [];
        for (let w = 0; w < numWorkers; w++) {
          workers.push(worker(w + 1));
        }
        await Promise.all(workers);

        // Filter valid results
        const validResults = results.filter((result): result is string[] => result !== null);
        const errorCount = results.length - validResults.length;

        console.log(`Completed processing: ${validResults.length} successful, ${errorCount} failed`);

        // Write results to CSV
        console.log("Writing results to CSV...");
        await this.writeResults(modelOutputFilePath, validResults, piiTypes, greetingTypes);

        // Write metrics
        console.log("Writing metrics...");
        await this.writeColumnMetricsCsv(
          groundTruthFilePath,
          modelOutputFilePath,
          metricsOutputFilePath,
          piiTypes,
          greetingTypes
        );

        console.log(`Results written to ${modelOutputFilePath}`);
        console.log(`Metrics written to ${metricsOutputFilePath}`);
        
        return { success: true };
      } catch (error: any) {
        console.log(`Attempt ${attempt + 1} failed with error:`, error);
        
        if (error.message?.includes('CSV validation')) {
          console.log(`CSV validation error: ${error.message}`);
          return { success: false, error: error.message };
        }
        
        console.log('Failed, error:', error.message);
        console.log('\nRetrying...\n');
        
        if (attempt < this.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('Reached Maximum No of retries\n');
          return { success: false, error: error.message };
        }
      }
    }

    return { success: false, error: 'Unexpected error' };
  }

  /**
   * Legacy guardrail method for backward compatibility
   */
  // async guardrail(options: GuardrailOptions): Promise<GuardRailResponse> {
  //   const url = `${basUrl}/guardrail/moderate`;

  //   // Validate piiList if provided
  //   if (options.piiList && options.piiList.length > 0) {
  //     const invalid = options.piiList.filter(item => !allowedPii.includes(item));
  //     if (invalid.length > 0) {
  //       throw new Error(
  //         `'piiList' must be empty or contain only: ${allowedPii.join(', ')}`
  //       );
  //     }
  //   }

  //   const payload = {
  //     text: options.text,
  //     greetings_list: options.greetingsList || [],
  //     text_type: options.textType || 'prompt',
  //     generic_safety_check: options.genericSafetyCheck ?? true,
  //     compliance_list: options.complianceList || [],
  //     pii_list: options.piiList || [],
  //   };

  //   try {
  //     const response: any = await axios.post(url, payload, {
  //       headers: {
  //         Authorization: `Bearer ${this.apiKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //       timeout: this.timeout,
  //     });
  //     return { success: true, data: response.data };
  //   } catch (error: any) {
  //     console.log("Failed to Generate Data From Walled Protect..", error.message);
  //     console.log('\nRetrying ....\n ')
  //     if (this.count < this.retries) {
  //       this.count++;
  //       await new Promise<void>((resolve) => { setTimeout(() => { resolve() }, 3000) });
  //       return await this.guardrail({
  //         text: options.text,
  //         genericSafetyCheck: options.genericSafetyCheck,
  //         greetingsList: options.greetingsList,
  //         textType: options.textType,
  //         complianceList: options.complianceList,
  //         piiList: options.piiList
  //       })
  //     }
  //     console.log("Failed ... ")
  //     return { success: false, error: error.message }
  //   }
  // }
}