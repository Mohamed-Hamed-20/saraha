import { NextFunction, Request, Response } from "express";
import { asyncHandler, CustomError } from "../utils/errorHandling.js";
import { verifyToken } from "../utils/tokens.js";
import userModel from "../DB/models/user.model.js";
import { Document, Types } from "mongoose";

export enum Roles {
  User = "user",
  Admin = "admin",
  Guest = "guest",
}
export interface Iuser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  age?: number;
  phone?: string;
  role: Roles;
  isConfirmed: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: Iuser;
    }
  }
}

export const isAuth = (roles: Array<Roles>) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { accessToken: accessTokenPrefix } = req.cookies;

      const accessToken = accessTokenPrefix.split(
        process.env.ACCESS_TOKEN_START_WITH || "Bearer "
      )[1];

      let decodedToken;

      decodedToken = verifyToken(
        accessToken,
        String(process.env.ACCESS_TOKEN_SECRET)
      );
      const { userId } = decodedToken;

      const finduser = await userModel.findById(new Types.ObjectId(userId), {
        password: 0,
        __v: 0,
      });
      if (!finduser) {
        return next(new CustomError("User not found", 404));
      }

      // chk authorized
      if (!roles.includes(finduser.role))
        return next(new CustomError("Unauthorized user", 401));

      req.user = finduser as Iuser;

      return next();
    }
  );
};
