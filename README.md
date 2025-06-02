# Walled AI SDK (Node.js)

A TypeScript/JavaScript SDK for interacting with Walled AI's Guardrail API.

---

## 📦 Installation

Install via npm or yarn:

```bash
npm install walledai
# or
yarn add walledai
```

---

## 🚀 Usage

### ➕ Import the SDK

```ts
import { WalledProtect, PII } from 'walledai';
```

---

## 🛠️ Initialize the Clients

```ts
const guardrailClient = new WalledProtect({
  apiKey: 'your_api_key_here',
  retries: 3,         // Optional, defaults to 3
  timeout: 20000      // Optional, defaults to 20000 ms
});

const piiClient = new PII({
  apiKey: 'your_api_key_here',
  retries: 3,         // Optional, defaults to 3
  timeout: 20000      // Optional, defaults to 20000 ms
});
```

---

## 🧪 Guardrail Check

*The Guardrail feature analyzes input text for safety, compliance, greetings, and PII, helping you moderate and filter user content according to your requirements.*

```ts
const response = await guardrailClient.guardrail({
  text: "Hello, how are you?",
  greetingsList: ["generalgreetings"],
  textType: "prompt", // Optional
  genericSafetyCheck: true // Optional
});

console.log(response);
```

---

### Guardrail Parameters

| Parameter            | Type        | Required | Description |
|----------------------|-------------|----------|-------------|
| `text`               | `string`    | ✅ Yes   | Input text to analyze |
| `greetingsList`      | `string[]`  | ❌ No    | List of greeting types (e.g. `["generalgreetings"]`) |
| `textType`           | `string`    | ❌ No    | Type of text (`"prompt"` by default) |
| `genericSafetyCheck` | `boolean`   | ❌ No    | Enable general safety filtering (defaults to `true`) |

---

### Guardrail Successful Response

```json
{
  "success": true,
  "data": {
    "safety": [{ "safety": "generic", "isSafe": true, "score": 5 }],
    "compliance": [],
    "pii": [],
    "greetings": [{ "greeting_type": "generalgreetings", "isPresent": true }]
  }
}
```

---

## 🕵️‍♂️ PII Masking

*The PII feature detects and masks personally identifiable information (PII) such as emails, phone numbers, and more, replacing them with placeholders and providing a mapping for reference.*

### Usage

```ts
const piiResponse = await piiClient.pii("My email is john.doe@example.com and my phone is 123-456-7890.");

console.log(piiResponse);
```

### PII Parameters

| Parameter | Type     | Required | Description |
|-----------|----------|----------|-------------|
| `text`    | `string` | ✅ Yes   | Input text to process for PII masking |

### PII Successful Response

```json
{
  "success": true,
  "data": {
    "success": true,
    "remark": "PII masked successfully",
    "input": "My email is john.doe@example.com and my phone is 123-456-7890.",
    "masked_text": "My email is PNA2 and my phone is PNA1.",
    "mapping": {
      "PNA2": "john.doe@example.com",
      "PNA1": "123-456-7890"
    }
  }
}
```

---

## ⚙️ Common Parameters

Both `WalledProtect` and `PII` accept the following config:

| Parameter | Type     | Required | Description |
|-----------|----------|----------|-------------|
| `apiKey`  | `string` | ✅ Yes   | API key obtained from Walled AI |
| `retries` | `number` | ❌ No    | Number of retry attempts on failure (default: `3`) |
| `timeout` | `number` | ❌ No    | Request timeout in milliseconds (default: `20000`) |

---

## ❌ Error Response

If a request fails after retrying:

```json
{
  "success": false,
  "error": "Network error or server failure message"
}
```

> 🔁 The SDK automatically retries requests that fail, up to the number of `retries` configured, with a delay between attempts.

---

## 📟 License

MIT © Walled AI

