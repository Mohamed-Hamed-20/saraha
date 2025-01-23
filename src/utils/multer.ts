import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import { FileType } from "./files.allowed";
import { asyncHandler, CustomError } from "./errorHandling";
import fs from "fs";
import path from "path";

export const configureMulter = (
  fileSize: number = 5 * 1024 * 1024,
  allowedFileTypes: Array<string> = FileType.Images
) => {

  const storage = multer.memoryStorage();

  const fileFilter = (req: Request, file: any, callback: any) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new CustomError(`Invalid file type: ${file.mimetype}.`, 400),
        false
      );
    }
  };

  const limits = { fileSize };

  return multer({ storage, fileFilter, limits });
};

// {
//     destination(req, file, callback) {
//       const uploadPath = path.join(
//         process.cwd(),
//         process.env.UPLOAD_DIR || "uploads"
//       );

//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath);
//       }
//       callback(null, uploadPath);
//     },
//     filename(req, file, callback) {
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       callback(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
//     },
//   }
