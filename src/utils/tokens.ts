import jwt, {
  JsonWebTokenError,
  JwtPayload,
  Secret,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { CustomError } from "./errorHandling";
import mongoose from "mongoose";

export const generateToken = (
  payload: JwtPayload,
  secretKey: Secret,
  expiresIn: string
): string | void => {
  try {
    const token = jwt.sign(payload, secretKey, {
      expiresIn: expiresIn,
      audience: String(process.env.app_url),
      issuer: String(process.env.companyName),
      subject: String(process.env.Email || "mohamed@gmail.com"),
    });

    if (!token) throw new Error("Token generation failed");

    return token;
  } catch (error: Error | JsonWebTokenError | any) {
    throw new CustomError(`Token generation failed: ${error?.message}`, 500);
  }
};
interface Payload {
  userId: mongoose.Types.ObjectId;
  role: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  sub: string;
}
export const verifyToken = (token: string, secretKey: Secret) => {
  try {
    const payload = jwt.verify(token, secretKey) as Payload;

    if (!payload) {
      throw new CustomError("Token verification failed: Invalid token", 400);
    }

    return payload;
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new CustomError(
        "Token verification failed: Token has expired",
        401
      );
    } else if (error instanceof NotBeforeError) {
      throw new CustomError(
        "Token verification failed: Token not active yet",
        401
      );
    } else if (error instanceof JsonWebTokenError) {
      throw new CustomError(`Token verification failed: ${error.message}`, 400);
    } else if (error instanceof CustomError) {
      throw error;
    } else if (error instanceof Error) {
      throw new CustomError(`Unexpected error: ${error.message}`, 500);
    } else {
      throw new CustomError(
        "Unknown error occurred during token verification",
        500
      );
    }
  }
};
