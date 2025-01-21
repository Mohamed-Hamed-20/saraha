import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    console.log({ message, status });

    super(message);
    this.status = status;
    this.name = "CustomError";
  }
}
//ERROR HANDLING
export const errorHandler: ErrorRequestHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof CustomError ? err.status : 500;
  res.status(statusCode || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;


// ASYNC handler
export const asyncHandler = (controller: ControllerFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    controller(req, res, next).catch((error: Error | CustomError) => {
      console.log({ error });

      const customError =
        error instanceof CustomError
          ? error
          : new CustomError(error.message, 500);

      res.status(customError.status || 500).json({
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    });
  };
};
