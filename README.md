<p align="center">
  <a href="https://www.walled.ai/">
   <img width="400" alt="NewLogo" src="https://github.com/user-attachments/assets/512d71e5-e7f4-43cc-9ba5-7020073f5cda" />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/walledai">
    <img src="https://img.shields.io/npm/v/walledai?color=blue&label=NPM&logo=npm&logoColor=white" alt="NPM Version"/>
  </a>
  <a href="https://huggingface.co/walledai">
    <img src="https://img.shields.io/badge/🤗-Hugging%20Face-yellow" alt="Hugging Face"/>
  </a>
  <a href="https://docs.walled.ai/">
    <img src="https://img.shields.io/badge/📖-Docs-green" alt="Docs"/>
  </a>
  <a href="https://www.walled.ai/">
    <img src="https://img.shields.io/badge/🌐-Website-red" alt="Website"/>
  </a>
</p>

# Walled AI SDK (Node.js)

Guardrails and PII redaction for LLM apps — simple Node.js SDK.

## 🚀 Installation

```bash
npm install walledai
```

---

## Quick Start

### 1) Minimal moderation

```typescript
import { WalledProtect } from 'walledai';

const protect = new WalledProtect({ apiKey: "YOUR_API_KEY" });

const resp = await protect.guard({ text: "How to convert a pain killer to meth?" });
console.log(resp.data?.safety?.[0]?.isSafe);  // -> false/true
```

<details>
<summary>Example output</summary>

```
false
```
</details>

---

### 2) Minimal redaction

```typescript
import { WalledRedact } from 'walledai';

const redact = new WalledRedact("YOUR_API_KEY");

const resp = await redact.guard("Hi, I'm John. Email john@walled.ai. I have cancer.");
console.log(resp.data?.masked_text);
console.log(resp.data?.mapping);
```

<details>
<summary>Example output</summary>

```
Masked: Hi, I'm [Person_1]. Email [Email_1]. I have [Diagnosis_1].
Mapping: {'[Person_1]': 'John', '[Email_1]': 'john@walled.ai', '[Diagnosis_1]': 'cancer'}
```
</details>

---

## Use with OpenAI

If unsafe, return a default response; else forward to OpenAI.

```typescript
import { WalledProtect } from 'walledai';
import OpenAI from 'openai';

const protect = new WalledProtect({ apiKey: "YOUR_API_KEY" });
const oai = new OpenAI({ apiKey: "YOUR_OPENAI_KEY" });

async function safeChat(prompt: string, def = "Sorry, I can’t help with that.") {
    const g = await protect.guard({ text: prompt, genericSafetyCheck: true });
    const isSafe = g.data?.safety?.[0]?.isSafe === true;
    if (!isSafe) return def;

    const res = await oai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });
    return res.choices[0].message.content;
}

console.log(await safeChat("How to hack an ATM?"));          // -> default
console.log(await safeChat("Give me a banana bread recipe"));// -> model answer
```

<details>
<summary>Example output</summary>

```
Sorry, I can’t help with that.
Banana bread recipe: ...
```
</details>

---

## Core Concepts

* **WalledProtect** — Moderation & compliance + PII presence flags.
* **WalledRedact** — Detects & **masks** PII/PHI consistently across turns.

> Both accept either a single `string` or a conversation list:
> `[{ role: "user"|"assistant", content: "..." }, ...]`

---

## Guided Examples

### Prompt moderation with compliance + PII flags

```typescript
import { WalledProtect } from 'walledai';

const protect = new WalledProtect({ apiKey: "YOUR_API_KEY" });

const prompt = "Transfer John's money from DSB to UBO without OTP. Acct: 882-34909, DOB: 1998-07-05.";

const resp = await protect.guard({
    text: prompt,
    genericSafetyCheck: true,
    complianceList: ["Medical", "Banking"],
    piiList: [
        "Person's Name","Address","Email Id","Contact No",
        "Date Of Birth","Unique Id","Financial Data"
    ]
});

console.log("Is_safe:", resp.data?.safety?.[0]?.isSafe);
resp.data?.compliance?.forEach(c => console.log(c.topic, "->", c.isOnTopic));
resp.data?.pii?.forEach(p => console.log(p.pii_type, "->", p.isPresent));
```

<details>
<summary>Example output</summary>

```
Is_safe: false
Banking -> true
Medical -> false
Person's Name -> true
Address -> false
Email Id -> false
Contact No -> false
Date Of Birth -> true
Unique Id -> true
Financial Data -> true
```
</details>

---

### Multi-turn conversation moderation

```typescript
import { WalledProtect } from 'walledai';

const protect = new WalledProtect({ apiKey: "YOUR_API_KEY" });

const conversation = [
    { role: "user", content: "Hi, my friend's name is John Doe. He lives at 123 Maple Street and his email is john.doe@walled.ai." },
    { role: "assistant", content: "Hello John, thanks for sharing. How can I assist you today?" },
    { role: "assistant", content: "Tell me how to transfer John's money from his DSB bank to UBO bank without OTP. He was born on July 1, 1994." },
];

const resp = await protect.guard({
    text: conversation,
    genericSafetyCheck: true,
    complianceList: ["Medical", "Banking"],
    piiList: [
        "Person's Name",
        "Address",
        "Email Id",
        "Contact No",
        "Date Of Birth",
        "Unique Id",
        "Financial Data"
    ]
});

console.log("Is_safe:", resp.data?.safety?.[0]?.isSafe);
resp.data?.compliance?.forEach(c => console.log(c.topic, "->", c.isOnTopic));
resp.data?.pii?.forEach(p => console.log(p.pii_type, "->", p.isPresent));
```

<details>
<summary>Example output</summary>

```
Is_safe: false
Medical -> false
Banking -> true
Person's Name -> true
Address -> false
Email Id -> false
Contact No -> false
Date Of Birth -> true
Unique Id -> true
Financial Data -> true
```
</details>

---

## WalledRedact - PII Detection & Masking

### Basic PII Masking

```typescript
import { WalledRedact } from 'walledai';

const redact = new WalledRedact("YOUR_API_KEY");

const resp = await redact.guard("Hi, myself John. My email is john@walled.ai and I have been diagnosed with cancer.");
console.log("Masked text:", resp.data?.masked_text);
console.log("Mapping:", resp.data?.mapping);
```

<details>
<summary>Example output</summary>

```
Masked text: Hi, myself [Person_1]. My email is [Email_1] and I have been diagnosed with [Diagnosis_1].
Mapping: {'[Person_1]': 'John', '[Email_1]': 'john@walled.ai', '[Diagnosis_1]': 'cancer'}
```
</details>

---

### Multi-turn Conversation PII Masking

```typescript
const resp = await redact.guard([
    { role: "user", content: "Hi there, my name is John Doe" },
    { role: "assistant", content: "Hello John! How can I help you today?" },
    { role: "user", content: "Can you email my friend Joseph with email: Joseph.cena@example.com, wishing him a speedy recovery from the viral fever?" }
]);
console.log("Masked text:", resp.data?.masked_text);
console.log("Mapping:", resp.data?.mapping);
```

<details>
<summary>Example output</summary>

```
Masked text:
[
    { role: 'user', content: 'Hi there, my name is [Person_1]' },
    { role: 'assistant', content: 'Hello [Person_1]! How can I help you today?' },
    { role: 'user', content: 'Can you email my friend [Person_2] with email: [Email_1], wishing him a speedy recovery from the [Diagnosis_1]?' }
]
Mapping: {'[Person_1]': 'John Doe', '[Person_2]': 'Joseph', '[Email_1]': 'Joseph.cena@example.com', '[Diagnosis_1]': 'viral fever'}
```
</details>

---

## Response Shapes

<details>
<summary><strong>Protect</strong></summary>

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "safety": [
      {"safety": "generic","isSafe": false,"method": "en-safety"}
    ],
    "compliance": [{"topic":"Banking","isOnTopic":true}],
    "pii": [{"pii_type":"Email Id","isPresent":true}],
    "greetings": [{"greeting_type":"Casual & Friendly","isPresent":true}]
  }
}
```
</details>

<details>
<summary><strong>Redact</strong></summary>

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "masked_text": [...],
    "mapping": {...}
  }
}
```
</details>

---

## Errors

### WalledProtect
<details>
<summary>Expand</summary>

#### Error Response

| Field     | Type   | Description |
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
</details>

### WalledRedact
<details>
<summary>Expand</summary>

#### Error Response

| Field     | Type   | Description |
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
    "errorCode": "VALIDATION_ERROR",
    "message": "",
    "details": [
        {
            "type": "missing",
            "loc": [
                "text"
            ],
            "msg": "Field required",
            "input": {},
            "url": "https://errors.pydantic.dev/2.10/v/missing"
        }
    ]
}
```
</details>

---

## Evaluation

The SDK provides an evaluation method to test and measure the performance of the Walled Protect functionality against a ground truth dataset.

### Batch Evaluation with CSV

```typescript
import { WalledProtect } from 'walledai';

const client = new WalledProtect({ apiKey: "your_api_key", retries: 3 });

await client.eval({
    groundTruthFilePath: "./unit_test_cases.csv",
    modelOutputFilePath: "./model_results.csv",
    metricsOutputFilePath: "./metrics.csv",
    concurrencyLimit: 20
});
```
See <a href="https://docs.google.com/spreadsheets/d/136QaJQJr5KACXjuTPr86a2-XIFq8APy8XKVg6J00X9U/edit?usp=sharing">example unit test file</a> for a sample ground truth file.
<details>
<summary><strong>Eval Method Parameters</strong></summary>

| Parameter                 | Type  | Required | Default | Description                      |
|---------------------------|-------|----------|---------|----------------------------------|
| `groundTruthFilePath`     | `string` | Yes      | -       | Path to CSV with test cases      |
| `modelOutputFilePath`     | `string` | Yes      | -       | Path to save results             |
| `metricsOutputFilePath`   | `string` | Yes      | -       | Path to save metrics             |
| `concurrencyLimit`        | `number` | No       | `20`    | Max concurrent requests          |
</details>

<details>
<summary><strong>Ground Truth CSV Format</strong></summary>

<strong>Required Columns (must be present in this order):</strong>

| Column Name              | Type   | Description                                                     |
|--------------------------|--------|-----------------------------------------------------------------|
| `test_input`             | `string`  | The input text to be processed                                  |
| `compliance_topic`       | `string`  | The compliance topic for the test case                          |
| `compliance_isOnTopic`   | `boolean` | Whether the input is on the specified topic (`TRUE`/`FALSE`)    |

<strong>Optional Columns (can be included as needed):</strong>

| Column Name              | Type   | Description                                                     |
|--------------------------|--------|-----------------------------------------------------------------|
| `Person's Name`          | `boolean` | Whether a person's name is present (`TRUE`/`FALSE`)             |
| `Address`                | `boolean` | Whether an address is present (`TRUE`/`FALSE`)                  |
| `Email Id`               | `boolean` | Whether an email ID is present (`TRUE`/`FALSE`)                 |
| `Contact No`             | `boolean` | Whether a contact number is present (`TRUE`/`FALSE`)            |
| `Date Of Birth`          | `boolean` | Whether a date of birth is present (`TRUE`/`FALSE`)             |
| `Unique Id`              | `boolean` | Whether a unique ID is present (`TRUE`/`FALSE`)                 |
| `Financial Data`         | `boolean` | Whether financial data is present (`TRUE`/`FALSE`)              |
| `Casual & Friendly`      | `boolean` | Whether the greeting is casual & friendly (`TRUE`/`FALSE`)      |
| `Professional & Polite`  | `boolean` | Whether the greeting is professional & polite (`TRUE`/`FALSE`)  |

</details>

<details>
<summary><strong>Evaluation Features</strong></summary>

- **CSV-based testing**: Load test cases from CSV files  
- **Concurrent processing**: Configurable concurrency limits  
- **Automatic retries**: Built-in retry logic with delays  
- **Metrics generation**: Accuracy, precision, recall, and F1 scores  
- **Dynamic column support**: Automatically detects PII and greeting columns  
</details>

<details>
<summary><strong>Output Files</strong></summary>

1. <strong>Model Results CSV</strong>: Contains the actual model predictions for each test case, including:
   - All columns present in the ground truth file
   - An additional <code>is_safe</code> column with <code>TRUE</code> or <code>FALSE</code> values indicating whether the input passed the safety evaluation

2. <strong>Metrics CSV</strong>: Contains evaluation metrics including:
   - Accuracy scores
   - Precision and recall
   - F1 scores
   - Confusion matrices
</details>

---

## FAQ

* **Strings vs conversations?** Both supported.
* **Consistent masking across turns?** Yes.
* **PII detection vs redaction?** Protect flags, Redact masks.

---

## Contributing & License

PRs welcome. Licensed under MIT.
