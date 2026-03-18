# Appwrite Deployment Notes

Use these settings when creating the Appwrite Site for LumiPods.

## Site Settings

- Name: `LumiPods`
- Repository: `DeepLeeScrambled87/LumiPods`
- Branch: `main`
- Root directory: `./`
- Framework: `React`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`Site ID` is optional. Leave it blank unless you want to define one yourself.

## Frontend Environment Variables

These go on the Appwrite Site build environment, not in the repo:

```env
VITE_POCKETBASE_URL=https://your-pocketbase-domain
VITE_LLM_PROVIDER=openai
VITE_SPEECH_PROVIDER=openai
VITE_OPENAI_PROXY_URL=https://your-openai-proxy-domain/api/openai
```

Optional:

```env
VITE_OLLAMA_URL=https://your-ollama-endpoint
VITE_OLLAMA_MODEL=llama3.2
```

## Important Deployment Constraint

This Appwrite Site will host the React frontend only.

The current repo still expects two external backend services:

- PocketBase for app data
- OpenAI proxy for server-side AI/TTS requests

Do **not** put `OPENAI_API_KEY` into the Appwrite Site frontend environment.
That key should stay server-side only.

## What Still Needs Hosting Outside the Site

### PocketBase

The app uses PocketBase-backed services for:

- learners
- families
- progress
- artifacts
- rewards redemptions
- learning records

You need a live PocketBase instance and should point `VITE_POCKETBASE_URL` at it.

### OpenAI Proxy

The app currently uses the Node proxy in:

- `server/openai-proxy.mjs`

That proxy is not automatically hosted by the Appwrite Site itself.

You have two options:

1. Host the OpenAI proxy separately and point `VITE_OPENAI_PROXY_URL` to it.
2. Convert the proxy into an Appwrite Function later.

## Recommended First Live Setup

1. Create the Appwrite Site with the settings above.
2. Deploy the frontend from `main`.
3. Host PocketBase separately and set `VITE_POCKETBASE_URL`.
4. Host the OpenAI proxy separately and set `VITE_OPENAI_PROXY_URL`.
5. Once those are live, test:
   - login
   - learner switching
   - schedule loading
   - Rewards
   - Lumi OpenAI chat + TTS
