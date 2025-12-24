# Gaod AI Security Notes

## 1. Hardening Overview
This document outlines the security measures implemented to harden the Gaod AI Client application.

### Checklist
- [x] **Rate Limiting (Client-Side):** Implemented a Token Bucket algorithm in `src/lib/security.js`. Limits users to ~10 messages/minute.
- [x] **Input Validation:** Schema validation added for chat messages (length, role, empty content) preventing invalid payloads from reaching the logic.
- [x] **XSS Protection:** `rehype-sanitize` added to `ChatInterface.jsx` to strip dangerous HTML/JS from Markdown rendering.
- [x] **Logging:** `SecurityLogger` implemented with PII redaction (emails, passwords, keys) and Request IDs for traceability.
- [x] **Environment Security:** Startup check for critical env vars. Keys are **not** hardcoded but fetched dynamically.

## 2. Architectural Limitations & Risks

### Client-Side API Keys
**Risk:** The application architecture is a Client-Side SPA (Single Page Application) that calls Google Vertex AI directly.
**Observation:** Even though we fetch the API Key from a secure database table (`app_settings`), the key **must** be exposed to the browser to make the `fetch` call to Google.
**Mitigation:**
1. The key is not in `git` or public `.env` files.
2. We recommend moving the `fetch` logic to a Supabase Edge Function or a Proxy Server in the future so the key never leaves the server environment.

### Rate Limiting
**Risk:** Rate limiting is currently enforced on the client (`localStorage`). A sophisticated attacker can bypass this by clearing storage or modifying the code.
**Mitigation:** This prevents accidental spam or basic abuse. Real security requires server-side rate limiting (e.g., via Supabase WAF or Edge Functions).

## 3. Future Recommendations
1. **Implement Supabase Edge Functions:** Move the `handleSendMessage` logic to a backend function. This solves both the "Exposed Key" and "Trusted Rate Limiting" issues.
2. **Content Security Policy (CSP):** Add strict CSP headers to the hosting provider (e.g., Vercel/Netlify) to prevent unauthorized script execution.
