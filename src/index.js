// import dns from "dns";
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
// dns.setServers(["1.1.1.1", "1.0.0.1"]);

// require("dotenv").config({ path: "./env" });

import "dotenv/config";
// import dotenv from "dotenv";
import connectDB from "./db/index.js";

// dotenv.config({
//   path: "./env",
// });

connectDB();

/*
const app = express();
import express from "express";
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERR", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App i slistening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR", error);
    throw err;
  }
})();
*/
