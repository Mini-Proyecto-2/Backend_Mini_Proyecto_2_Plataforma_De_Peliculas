// api/config/database.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Establishes a connection to the MongoDB database.
 *
 * Retrieves the connection string from the environment variable `MONGODB_URI`.
 * On success, logs a confirmation message. On failure, logs the error and
 * terminates the process with exit code `1`.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the connection is successfully established.
 * @throws {Error} Throws and terminates the process if the connection fails or the URI is not defined.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }
    await mongoose.connect(mongoUri, {
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
    } else {
      console.error("Error connecting to MongoDB:", error);
    }
    process.exit(1);
  }
};

/**
 * Disconnects from the MongoDB database.
 *
 * Gracefully closes the active Mongoose connection and logs the result.
 * Logs any error that occurs during disconnection.
 *
 * @async
 * @function disconnectDB
 * @returns {Promise<void>} Resolves when the connection is successfully closed.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error disconnecting from MongoDB:", error.message);
    } else {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }
};