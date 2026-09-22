import { GoogleGenAI } from '@google/genai'
import { config } from '../config.js'

/*
  One Google GenAI client for the whole process, built lazily. The AI planner is
  an optional feature: if GEMINI_API_KEY is unset the rest of the API still
  works, so we never construct the client and never crash the server at boot.
  getGenAI() returns null in that case and the planner controller turns it into
  a clear 503.
*/
let client = null

export const isPlannerConfigured = () => Boolean(config.geminiApiKey)

export const getGenAI = () => {
  if (!config.geminiApiKey) return null
  if (!client) client = new GoogleGenAI({ apiKey: config.geminiApiKey })
  return client
}
