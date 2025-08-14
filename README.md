# Walled AI SDK (Node.js)

A TypeScript/JavaScript SDK for interacting with Walled AI's Guardrail and PII Redaction APIs.

---

## 📦 Installation

Install via npm or yarn:

```bash
npm install walledai
# or
yarn add walledai
```

---

## 🚀 Quick Start

### Import the SDK

```ts
import { WalledProtect, WalledRedact } from 'walledai';
```

### Initialize the Clients

```ts
// Initialize WalledProtect for content moderation and safety checks
const walledProtect = new WalledProtect({
  apiKey: 'your_api_key_here',
  retries: 3,         // Optional, defaults to 3
  timeout: 20000      // Optional, defaults to 20000 ms
});

// Initialize WalledRedact for PII detection and masking
const walledRedact = new WalledRedact(
  'your_api_key_here',
  2,                  // Optional retries, defaults to 2
  20000               // Optional timeout, defaults to 20000 ms
);
```

---

## 🛡️ WalledProtect - Content Moderation & Safety

The `WalledProtect` class provides comprehensive content moderation capabilities including safety checks, compliance validation, PII detection, and greeting analysis.

### Basic Content Analysis

```ts
const response = await walledProtect.guard({
  text: "Hello, how are you? My email is john@example.com",
  greetingsList: ["Casual & Friendly", "Professional & Polite"],
  genericSafetyCheck: true,
  complianceList: ["GDPR"],
  piiList: ["Email Id", "Contact No"]
});

console.log(response);
```

### Multi-turn Conversation Analysis

```ts
const conversation = [
  { role: "user", content: "What's your name?" },
  { role: "assistant", content: "I'm an AI assistant. How can I help you?" }
];

const response = await walledProtect.guard({
  text: conversation,
  greetingsList: ["Professional & Polite"],
  genericSafetyCheck: true
});
```

### Batch Evaluation with CSV

For large-scale testing and evaluation:

```ts
const evalResponse = await walledProtect.eval({
  groundTruthFilePath: './test-cases.csv',
  modelOutputFilePath: './results.csv',
  metricsOutputFilePath: './metrics.csv',
  concurrencyLimit: 20  // Optional, defaults to 20
});
```

**Required CSV Format:**
```csv
test_input,compliance_topic,compliance_isOnTopic,Person's Name,Email Id,Casual & Friendly
"Hello world",GDPR,TRUE,FALSE,FALSE,TRUE
"My email is test@example.com",GDPR,FALSE,FALSE,TRUE,FALSE
```

### WalledProtect Parameters

#### Guard Method Parameters

| Parameter            | Type                    | Required | Description |
|----------------------|-------------------------|----------|-------------|
| `text`               | `string \| TextInput[]` | ✅ Yes   | Input text or conversation array |
| `greetingsList`      | `string[]`              | ❌ No    | Greeting types to check (default: `["Casual & Friendly"]`) |
| `genericSafetyCheck` | `boolean`               | ❌ No    | Enable safety filtering (default: `true`) |
| `complianceList`     | `string[]`              | ❌ No    | Compliance categories to check |
| `piiList`            | `PiiType[]`             | ❌ No    | PII categories to detect |

#### Eval Method Parameters

| Parameter              | Type     | Required | Description |
|------------------------|----------|----------|-------------|
| `groundTruthFilePath`  | `string` | ✅ Yes   | Path to CSV with test cases |
| `modelOutputFilePath`  | `string` | ✅ Yes   | Path to save results |
| `metricsOutputFilePath`| `string` | ✅ Yes   | Path to save metrics |
| `concurrencyLimit`     | `number` | ❌ No    | Max concurrent requests (default: `20`) |

#### Allowed PII Types

- `"Person's Name"`
- `"Address"`
- `"Email Id"`
- `"Contact No"`
- `"Date Of Birth"`
- `"Unique Id"`
- `"Financial Data"`

#### Allowed Greeting Types

- `"Casual & Friendly"`
- `"Professional & Polite"`

### WalledProtect Response Format

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "safety": [
      {
        "safety": "generic",
        "isSafe": true,
        "score": null,
        "method": "en-safety",
        "processing_time": 0.18735170364379883,
        "models_used": ["walled_e_guard_a"]
      }
    ],
    "compliance": [
      {
        "topic": "ask about medical",
        "isOnTopic": false,
        "error": null
      }
    ],
    "pii": [
      {
        "pii_type": "Email Id",
        "isPresent": false,
        "error": null
      }
    ],
    "greetings": [
      {
        "greeting_type": "Professional & Polite",
        "isPresent": false,
        "error": null
      }
    ]
  }
}
```

---

## 🔒 WalledRedact - PII Detection & Masking

The `WalledRedact` class detects and masks personally identifiable information (PII) in text, replacing sensitive data with placeholders.

### Basic PII Masking

```ts
const response = await walledRedact.guard(
  "My email is john.doe@example.com and my phone is 123-456-7890."
);

console.log(response);
```

### Multi-turn Conversation PII Masking

```ts
const conversation = [
  { role: "user", content: "My email is test@example.com" },
  { role: "assistant", content: "I'll contact you at that email" }
];

const response = await walledRedact.guard(conversation);
```

### WalledRedact Parameters

| Parameter | Type                    | Required | Description |
|-----------|-------------------------|----------|-------------|
| `text`    | `string \| TextInput[]` | ✅ Yes   | Text or conversation to process |

### WalledRedact Response Format

```json
{
  "status": "success",
  "data": {
    "success": true,
    "statusCode": 2001,
    "remark": "guardrails success type 21",
    "input": [
      {
        "role": "user",
        "content": "Hi there, can you help me with some information?"
      },
      {
        "role": "assistant",
        "content": "Of course! What would you like to know?"
      },
      {
        "role": "user",
        "content": "Can you suggest some healthy habits for daily life?"
      }
    ],
    "masked_text": [
      {
        "role": "user",
        "content": "Hi there, can you help me with some information?"
      },
      {
        "role": "assistant",
        "content": "Of course! What would you like to know?"
      },
      {
        "role": "user",
        "content": "Can you suggest some healthy habits for daily life?"
      }
    ],
    "mapping": {},
    "error": null
  }
}
```

---

## ⚙️ Configuration Options

### WalledProtect Configuration

```ts
const walledProtect = new WalledProtect({
  apiKey: 'your_api_key_here',
  retries: 3,         // Number of retry attempts (default: 3)
  timeout: 20000      // Request timeout in milliseconds (default: 20000)
});
```

### WalledRedact Configuration

```ts
const walledRedact = new WalledRedact(
  'your_api_key_here',
  2,                  // Number of retry attempts (default: 2)
  20000               // Request timeout in milliseconds (default: 20000)
);
```

---

## 📊 Batch Evaluation Features

The `eval()` method provides comprehensive batch testing capabilities:

### Features
- **CSV-based testing**: Load test cases from CSV files
- **Concurrent processing**: Configurable concurrency limits
- **Automatic retries**: Built-in retry logic with delays
- **Metrics generation**: Accuracy, precision, recall, and F1 scores
- **Dynamic column support**: Automatically detects PII and greeting columns

### Output Files
1. **Model Output**: Contains predictions for each test case
2. **Metrics**: Performance metrics for each column (accuracy, precision, recall, F1)

### Example Metrics Output
```csv
metrics,accuracy,precision,recall,f1,TP,TN,FP,FN
compliance_isOnTopic,0.950,0.923,0.857,0.889,12,45,1,2
Email Id,0.983,1.000,0.800,0.889,8,51,0,2
Casual & Friendly,0.967,0.909,0.909,0.909,10,48,1,1
```

---

## ❌ Error Handling

Both classes return consistent error responses:

```json
{
  "status": "error",
  "code": 500,
  "error": "Network error or server failure message"
}
```

### Error Handling Features
- **Automatic retries**: Failed requests are automatically retried
- **Configurable delays**: 2-3 second delays between retry attempts
- **Graceful degradation**: Returns error responses instead of throwing exceptions
- **Detailed logging**: Console logs for debugging retry attempts

---

## 🔄 Legacy Support

For backward compatibility, `WalledProtect` still supports the legacy `guardrail()` method:

```ts
const response = await walledProtect.guardrail({
  text: "Hello, how are you?",
  greetingsList: ["generalgreetings"],
  textType: "prompt",
  genericSafetyCheck: true,
  complianceList: ["GDPR"],
  piiList: ["Email Id", "Contact No"]
});
```

> **Note**: The `guardrail()` method now returns the same response format as the `guard()` method, with `status`, `code`, and `data` fields.

---

## 📟 License

MIT © Walled AI

