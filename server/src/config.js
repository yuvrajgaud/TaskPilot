import 'dotenv/config'

/*
  Every environment-dependent value is read once, here, and nowhere else.
  Task 2 needs no secrets, so sensible defaults let `npm start` run with no
  .env file at all. Task 3 and 4 add DATABASE_URL, JWT_SECRET and the Gemini
  key to this same object.
*/
export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // A comma-separated allowlist, so the deployed client and local dev can both
  // be permitted. CORS (app.js) refuses every origin not in this list once the
  // API is public — Task 2 left CORS fully open.
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
}
