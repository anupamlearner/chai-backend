import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const URI = process.env.MONGODB_URI;
    const connectionInstance = await mongoose.connect(URI, {
      dbName: DB_NAME,
    });
    console.log("...");
    console.log(
      `----> MongoDB connected ✅\n----> DB HOST:  ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection failed 😋 \n", error);
    process.exit(1);
  }
};

export default connectDB;
