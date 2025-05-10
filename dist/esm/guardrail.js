var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
/**
 * WalledProtect class handles interaction with Walled AI's Guardrail API.
 */
export class WalledProtect {
    /**
     * @param apiKey API key for Walled AI
     * @param retries Number of retry attempts (default 3)
     * @param timeout Request timeout in ms (default 20000 ms) in milliseconds
      */
    constructor(config) {
        this.apiKey = config.apiKey;
        this.retries = (config === null || config === void 0 ? void 0 : config.retries) || 3;
        this.timeout = (config === null || config === void 0 ? void 0 : config.timeout) || 20000;
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
    guardrail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const url = 'https://idy5alt3vg.execute-api.ap-southeast-1.amazonaws.com/Development/guardrail/moderate';
            const payload = {
                text: options.text,
                greetings_list: options.greetingsList || [],
                text_type: options.textType || 'prompt',
                generic_safety_check: (_a = options.genericSafetyCheck) !== null && _a !== void 0 ? _a : true,
            };
            try {
                const response = yield axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: this.timeout,
                });
                return { success: true, data: response.data };
            }
            catch (error) {
                console.log("Failed to Generate Data From Walled Protect..", error.message);
                console.log('\nRetrying ....\n ');
                if (this.count < this.retries) {
                    this.count++;
                    yield new Promise((resolve) => { setTimeout(() => { resolve(); }, 3000); });
                    return yield this.guardrail({ text: options.text, genericSafetyCheck: options.genericSafetyCheck, greetingsList: options.greetingsList, textType: options.textType });
                }
                console.log("Failed ... ");
                return { success: false, error: error.message };
            }
        });
    }
}
