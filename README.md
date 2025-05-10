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

#### ✅ ES Module (ESM)

```ts
import { WalledProtect } from 'walledai';
```

#### ✅ CommonJS

```js
const { WalledProtect } = require('walledai');
```

---

### 🛠️ Initialize the Client

```ts
const client = new WalledProtect({
  apiKey: 'your_api_key_here',
  retries: 3,         // Optional, defaults to 3
  timeout: 20000      // Optional, defaults to 20000 ms
});
```

---

### 🧪 Guardrail Check

```ts
const response = await client.guardrail({
  text: "Hello, how are you?",
  greetingsList: ["generalgreetings"],
  textType: "prompt", // Optional
  genericSafetyCheck: true // Optional
});

console.log(response);
```

---

## ⚙️ Parameters

### `new WalledProtect(config)`

| Parameter | Type     | Required | Description |
|-----------|----------|----------|-------------|
| `apiKey`  | `string` | ✅ Yes   | API key obtained from Walled AI |
| `retries` | `number` | ❌ No    | Number of retry attempts on failure (default: `3`) |
| `timeout` | `number` | ❌ No    | Request timeout in milliseconds (default: `20000`) |

---

### `guardrail(options)`

| Parameter            | Type        | Required | Description |
|----------------------|-------------|----------|-------------|
| `text`               | `string`    | ✅ Yes   | Input text to analyze |
| `greetingsList`      | `string[]`  | ❌ No    | List of greeting types (e.g. `["generalgreetings"]`) |
| `textType`           | `string`    | ❌ No    | Type of text (`"prompt"` by default) |
| `genericSafetyCheck` | `boolean`   | ❌ No    | Enable general safety filtering (defaults to `true`) |

---

## ✅ Successful Response

The response from `guardrail()` is a plain object:

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

