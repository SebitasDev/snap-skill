import { Request, Response } from "express";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Archivo requerido" });
    }

    return res.json({
      url: (req.file as any).path,
      public_id: (req.file as any).filename,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir archivo", error });
  }
};
