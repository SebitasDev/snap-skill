import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import app from "./app";

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
});
