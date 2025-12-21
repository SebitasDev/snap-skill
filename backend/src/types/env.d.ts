declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_URI: string;
    MONGO_DB: string;
    CLOUDINARY_CLOUD: string;
    CLOUDINARY_KEY: string;
    CLOUDINARY_SECRET: string;
  }
}
