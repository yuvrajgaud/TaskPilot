import 'dotenv/config'

/*
  Every environment-dependent value is read once, here, and nowhere else.
  Task 2 needs no secrets, so sensible defaults let `npm start` run with no
  .env file at all. Task 3 and 4 add DATABASE_URL, JWT_SECRET and the Claude
  key to this same object.
*/
export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
}
