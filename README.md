# Walled AI SDK (Node.js)

A TypeScript/JavaScript SDK for interacting with Walled AI's Guardrail and PII Redaction APIs.

## Installation

Install via npm or yarn:

```bash
npm install walledai
# or
yarn add walledai
```

## Quick Start

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

## WalledProtect - Content Moderation & Safety

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
const response = await walledProtect.guard({
  text: [
    { role: "user", content: "Hi, I'm John Doe. I live at 123 Maple Street and my email is john.doe@example.com"},
    { role: "assistant", content: "Hello John, how can I assist you today?" },
  ],
  greetingsList: [
    "Casual & Friendly",
    "Professional & Polite"
  ],
  genericSafetyCheck: true,
  complianceList: ['Medical', 'Finance', 'Legal'],
  piiList: [
    "Person's Name",
    'Address',
    'Email Id',
    'Contact No',
    'Date Of Birth',
    'Unique Id',
    'Financial Data'
  ]
});

console.log(response);
```

### Parameters

#### Guard Method Parameters

| Parameter            | Type                    | Required | Default                      | Description |
|----------------------|-------------------------|----------|------------------------------|-------------|
| `text`               | `string \| TextInput[]` | Yes      | -                            | Input text or conversation array |
| `greetingsList`      | `string[]`              | No       | `["Casual & Friendly"]`      | Greeting types to check |
| `genericSafetyCheck` | `boolean`               | No       | `true`                       | Enable safety filtering |
| `complianceList`     | `string[]`              | No       | `[]`                         | Compliance categories to check |
| `piiList`            | `PiiType[]`             | No       | `[]`                         | PII categories to detect |

#### Allowed PII Types

| PII Type          | Description |
|-------------------|-------------|
| `"Person's Name"` | Individual's full or partial name |
| `"Address"`       | Physical or mailing addresses |
| `"Email Id"`      | Email addresses |
| `"Contact No"`    | Phone numbers and contact information |
| `"Date Of Birth"` | Birth dates and age-related information |
| `"Unique Id"`     | Social security numbers, IDs, licenses |
| `"Financial Data"`| Credit cards, bank accounts, financial info |

#### Allowed Greeting Types

| Greeting Type            | Description |
|--------------------------|-------------|
| `"Casual & Friendly"`    | Informal, warm greetings |
| `"Professional & Polite"`| Formal, business-appropriate greetings |

### Response Format

#### Successful Response Structure


| Field      | Type   | Description |
|------------|--------|-------------|
| `success`  | `boolean` | Indicates if the request was processed successfully |
|`statusCode`|  `number` | Http Status Code|
| `data`     | `object` | Contains the analysis results |

#### Data Object Structure

**Safety Section:**

| Field             | Type       | Description |
|-------------------|------------|-------------|
| `safety`          | `string`   | Type of safety check performed |
| `isSafe`          | `boolean`  | Whether the content passed safety checks |
| `score`           | `number`   | Safety confidence score (if available) |
| `method`          | `string`   | Safety detection method used |
| `processing_time` | `number`   | Time taken for safety analysis in seconds |
| `models_used`     | `string[]` | List of AI models used for safety evaluation |

**Compliance Section:**

| Field       | Type      | Description |
|-------------|-----------|-------------|
| `topic`     | `string`  | The compliance topic being checked |
| `isOnTopic` | `boolean` | Whether the content relates to the compliance topic |
| `error`     | `string`  | Any error encountered during compliance check |

**PII Section:**

| Field       | Type      | Description |
|-------------|-----------|-------------|
| `pii_type`  | `string`  | Type of PII being detected |
| `isPresent` | `boolean` | Whether this PII type was found in the content |
| `error`     | `string`  | Any error encountered during PII detection |

**Greetings Section:**

| Field           | Type      | Description |
|-----------------|-----------|-------------|
| `greeting_type` | `string`  | Type of greeting being analyzed |
| `isPresent`     | `boolean` | Whether this greeting type was detected |
| `error`         | `string`  | Any error encountered during greeting analysis |

#### Example Response

```json
{
    "success": true,
    "statusCode": 200,
    "data": {
        "safety": [
            {
                "safety": "generic",
                "isSafe": false,
                "score": null,
                "method": "en-safety",
                "processing_time": 0.41751790046691895,
                "models_used": [
                    "walled_e_guard_a"
                ]
            }
        ],
        "compliance": [
            {
                "topic": "sdfsdf",
                "isOnTopic": false,
                "error": null
            }
        ],
        "pii": [
            {
                "pii_type": "Person's Name",
                "isPresent": true,
                "error": null
            },
            {
                "pii_type": "Address",
                "isPresent": true,
                "error": null
            },
            {
                "pii_type": "Email Id",
                "isPresent": true,
                "error": null
            },
            {
                "pii_type": "Contact No",
                "isPresent": false,
                "error": null
            },
            {
                "pii_type": "Date Of Birth",
                "isPresent": false,
                "error": null
            },
            {
                "pii_type": "Unique Id",
                "isPresent": false,
                "error": null
            },
            {
                "pii_type": "Financial Data",
                "isPresent": false,
                "error": null
            }
        ],
        "greetings": [
            {
                "greeting_type": "Casual & Friendly",
                "isPresent": true,
                "error": null
            },
            {
                "greeting_type": "Professional & Polite",
                "isPresent": true,
                "error": null
            }
        ]
    }
}
```

### Evaluation

The `eval()` method provides comprehensive batch testing capabilities for evaluating model performance against ground truth datasets.

#### Batch Evaluation with CSV

For large-scale testing and evaluation:

```ts
const evalResponse = await walledProtect.eval({
  groundTruthFilePath: './test-cases.csv',
  modelOutputFilePath: './results.csv',
  metricsOutputFilePath: './metrics.csv',
  concurrencyLimit: 20  // Optional, defaults to 20
});
```

#### Eval Method Parameters

| Parameter              | Type     | Required | Default | Description |
|------------------------|----------|----------|---------|-------------|
| `groundTruthFilePath`  | `string` | Yes      | -       | Path to CSV with test cases |
| `modelOutputFilePath`  | `string` | Yes      | -       | Path to save results |
| `metricsOutputFilePath`| `string` | Yes      | -       | Path to save metrics |
| `concurrencyLimit`     | `number` | No       | `20`    | Max concurrent requests |

#### Ground Truth CSV Format

**Required Columns (must be present in this order):**

| Column Name          | Type      | Description |
|----------------------|-----------|-------------|
| `test_input`         | `string`  | The input text to be processed |
| `compliance_topic`   | `string`  | The compliance topic for the test case |
| `compliance_isOnTopic` | `boolean` | Whether the input is on the specified compliance topic (`TRUE` or `FALSE`) |

**Optional Columns (can be included as needed):**

| Column Name            | Type      | Description |
|------------------------|-----------|-------------|
| `Person's Name`        | `boolean` | Whether a person's name is present (`TRUE` or `FALSE`) |
| `Address`              | `boolean` | Whether an address is present (`TRUE` or `FALSE`) |
| `Email Id`             | `boolean` | Whether an email ID is present (`TRUE` or `FALSE`) |
| `Contact No`           | `boolean` | Whether a contact number is present (`TRUE` or `FALSE`) |
| `Date Of Birth`        | `boolean` | Whether a date of birth is present (`TRUE` or `FALSE`) |
| `Unique Id`            | `boolean` | Whether a unique ID is present (`TRUE` or `FALSE`) |
| `Financial Data`       | `boolean` | Whether financial data is present (`TRUE` or `FALSE`) |
| `Casual & Friendly`    | `boolean` | Whether the greeting is casual & friendly (`TRUE` or `FALSE`) |
| `Professional & Polite`| `boolean` | Whether the greeting is professional & polite (`TRUE` or `FALSE`) |

**Example CSV:**
```csv
test_input,compliance_topic,compliance_isOnTopic,Person's Name,Email Id,Casual & Friendly
"Hello world",GDPR,TRUE,FALSE,FALSE,TRUE
"My email is test@example.com",GDPR,FALSE,FALSE,TRUE,FALSE
```

See [example unit test file](https://docs.google.com/spreadsheets/d/136QaJQJr5KACXjuTPr86a2-XIFq8APy8XKVg6J00X9U/edit?usp=sharing) for a sample ground truth file.

#### Evaluation Features

- **CSV-based testing**: Load test cases from CSV files
- **Concurrent processing**: Configurable concurrency limits
- **Automatic retries**: Built-in retry logic with delays
- **Metrics generation**: Accuracy, precision, recall, and F1 scores
- **Dynamic column support**: Automatically detects PII and greeting columns

#### Output Files

1. **Model Output**: Contains predictions for each test case
2. **Metrics**: Performance metrics for each column (accuracy, precision, recall, F1)

**Example Metrics Output:**
```csv
metrics,accuracy,precision,recall,f1,TP,TN,FP,FN
compliance_isOnTopic,0.950,0.923,0.857,0.889,12,45,1,2
Email Id,0.983,1.000,0.800,0.889,8,51,0,2
Casual & Friendly,0.967,0.909,0.909,0.909,10,48,1,1
```

## WalledRedact - PII Detection & Masking

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

### Parameters

| Parameter | Type                    | Required | Description |
|-----------|-------------------------|----------|-------------|
| `text`    | `string \| TextInput[]` | Yes      | Text or conversation to process |

### Response Format

#### Successful Response Structure

| Field      | Type   | Description |
|------------|--------|-------------|
| `success`  | `boolean` | Indicates if the request was processed successfully |
|`statusCode`|  `number` | Http Status Code
| `data`     | `object` | Contains the analysis results |


#### Data Object Structure

| Field         | Type       | Description |
|---------------|------------|-------------|
| `success`     | `boolean`  | Whether the redaction was successful |
| `statusCode`  | `number`   | Status code of the operation |
| `remark`      | `string`   | Additional remarks about the operation |
| `input`       | `array`    | Original input text/conversation |
| `masked_text` | `array`    | Text with PII replaced by placeholders |
| `mapping`     | `object`   | Mapping of placeholders to original PII values |
| `error`       | `string`   | Any error encountered during processing |

#### Example Response

```json
{
    "success": true,
    "statusCode": 200,
    "data": {
        "success": true,
        "statusCode": 2001,
        "remark": "guardrails success type 21",
        "input": [
            {
                "role": "user",
                "content": "Hi, I'm John Doe. I live at 123 Maple Street and my email is john.doe@example.com"
            },
            {
                "role": "assistant",
                "content": "Hello John, how can I assist you today?"
            }
        ],
        "masked_text": [
            {
                "role": "user",
                "content": "Hi, I’m [Person_1]. I live at [Address_1] and my email is [Email_1]"
            },
            {
                "role": "assistant",
                "content": "Hello [Person_1], how can I assist you today?"
            }
        ],
        "mapping": {
            "[Person_1]": "John Doe",
            "[Address_1]": "123 Maple Street",
            "[Email_1]": "john.doe@example.com"
        },
        "error": null
    }
}
```

## Configuration Options

### WalledProtect Configuration

| Parameter | Type     | Required | Default | Description |
|-----------|----------|----------|---------|-------------|
| `apiKey`  | `string` | Yes      | -       | Your Walled AI API key |
| `retries` | `number` | No       | `3`     | Number of retry attempts |
| `timeout` | `number` | No       | `20000` | Request timeout in milliseconds |

```ts
const walledProtect = new WalledProtect({
  apiKey: 'your_api_key_here',
  retries: 3,
  timeout: 20000
});
```

### WalledRedact Configuration

| Parameter | Type     | Required | Default | Description |
|-----------|----------|----------|---------|-------------|
| `apiKey`  | `string` | Yes      | -       | Your Walled AI API key |
| `retries` | `number` | No       | `2`     | Number of retry attempts |
| `timeout` | `number` | No       | `20000` | Request timeout in milliseconds |

```ts
const walledRedact = new WalledRedact(
  'your_api_key_here',
  2,
  20000
);
```

## Error Handling

Both classes return consistent error responses:

#### Error Response
| Field           | Type      | Description |
|-----------|--------|-------------|
| `success` | `boolean` | Always `false` for error responses |
| `statusCode`| `number`  | Http Status Code for errors |
| `errorCode`| `string`| Main Model Error Code (for guardrail/pii)|
| `message`|`string`| Description of Error|
| `details`| `object`| Details of Error|
```json
{
    "success": false,
    "statusCode": 400,
    "errorCode": "INVALID_GREETING_TYPE",
    "message": "Invalid greeting types: ['Casual & Friendlyy']. Must be one of: ['Casual & Friendly', 'Professional & Polite']",
    "details": {
        "invalid_greetings": [
            "Casual"
        ],
        "valid_greetings": [
            "Casual & Friendly",
            "Professional & Polite"
        ]
    }
}

```
> Checkout [documentation](https://docs.walled.ai/error-codes-1302667m0) for understanding of error codes 
### Error Handling Features

- **Automatic retries**: Failed requests are automatically retried
- **Configurable delays**: 2-3 second delays between retry attempts
- **Graceful degradation**: Returns error responses instead of throwing exceptions
- **Detailed logging**: Console logs for debugging retry attempts

## License

MIT © Walled AI