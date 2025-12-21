import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        dbName: process.env.MONGO_DB as string,
      } as mongoose.ConnectOptions
    );

    console.log("Mongo conectado");
  } catch (error) {
    console.error("Error Mongo:", error);
    process.exit(1);
  }
};
