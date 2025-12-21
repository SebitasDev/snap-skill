import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./src/config/db";
import app from "./src/app";

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
  });
});
