import mongoose, { Connection } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Please define MONGODB_URL in .env.local");
}

const connectDb = async (): Promise<Connection> => {
  if (global.mongoose?.conn) {
    console.log("✅ Already connected");
    return global.mongoose.conn;
  }

  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
  }

  if (!global.mongoose.promise) {
    console.log("🔄 Creating new connection...");
    global.mongoose.promise = mongoose
      .connect(MONGODB_URL)
      .then((mongooseInstance) => mongooseInstance.connection);
  }

  global.mongoose.conn = await global.mongoose.promise;

  console.log("🚀 MongoDB Connected Successfully");

  return global.mongoose.conn;
};

export default connectDb;
