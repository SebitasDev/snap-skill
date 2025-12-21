import { IServiceSchema } from "../path/to/your/service.interface";

declare global {
  namespace Express {
    interface Request {
      service?: IServiceSchema;
    }
  }
}
