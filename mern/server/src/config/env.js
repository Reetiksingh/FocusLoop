import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/life-pro",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || "replace-access-secret",
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "replace-refresh-secret",
  accessTokenTtl: process.env.JWT_ACCESS_TTL || "15m",
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || "7d"
};
