import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = () => {
  const connection = mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name",
  );
  if (!connection) {
    throw new Error("Failed to connect to the database");
  }
  console.log("Connected to the database");
  return connection;
};
