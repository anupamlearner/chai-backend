import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connetDB = async () => {
  try {
    const URI = process.env.MONGODB_URI;
    const connectionInstance = await mongoose.connect(URI);
    console.log(
      `\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error 😋 \n", error);
    process.exit(1);
  }
};

export default connetDB;
