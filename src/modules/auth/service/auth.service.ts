import express, { Request, Response, NextFunction } from "express";
import userModel from "../../../DB/models/user.model";
import { hashSync, compareSync } from "bcryptjs";
import { CustomError } from "../../../utils/errorHandling";
import emailQueue from "../../../utils/email.Queue";
import { SignUpTemplet } from "../../../utils/htmlTemplet";
import { encrypt } from "../../../utils/crpto";
import { sanatizeUser } from "../../../utils/sanatize.data";
import { generateToken, verifyToken } from "../../../utils/tokens";
import { Secret, TokenExpiredError } from "jsonwebtoken";
import { cokkiesOptions } from "../../../utils/cookies";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, password, age, phone } = req.body;

  const chkemail = await userModel.findOne({ email }).select("email");
  if (chkemail) return next(new CustomError("Email is Already Exist", 404));

  const hashpassword = hashSync(password, Number(process.env.SALT_ROUND));
  const encryptPhone = phone
    ? encrypt(phone, String(process.env.SECRETKEY_CRYPTO))
    : undefined;

  const result = new userModel({
    name,
    email,
    password: hashpassword,
    age,
    phone: encryptPhone,
  });

  const response = await result.save();
  if (!result) return next(new CustomError("Something went wrong!", 500));

  res.status(201).json({
    message: "user Data Added successfully",
    user: sanatizeUser(response),
  });
  const token = generateToken(
    { userId: response._id },
    String(process.env.ACCESS_TOKEN_SECRET),
    "20m"
  );
  await emailQueue.add(
    {
      to: response.email,
      subject: "Sara7a Team",
      text: "Welcome to My Sara7a App! 🎉",
      html: SignUpTemplet(
        `${req.protocol}://${req.headers.host}/api/v1/auth/confirm/${token}/email`
      ),
      message: "Please confirm ur email",
    },
    { attempts: 3, backoff: 5000, removeOnComplete: true, removeOnFail: true }
  );
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const findUser = await userModel
    .findOne({ email })
    .select("name email password age")
    .lean();

  if (!findUser) return next(new CustomError("Invalid Email or Password", 404));

  const chkPassword: boolean = compareSync(password, String(findUser.password));

  if (!chkPassword)
    return next(new CustomError("Invalid Email or Password", 404));

  // access Token
  const accessToken = generateToken(
    { userId: findUser._id, role: findUser.role, IpAddress: req.ip },
    String(process.env.ACCESS_TOKEN_SECRET),
    "2h"
  );

  // Refresh Token
  const refreshToken = generateToken(
    { userId: findUser._id, role: findUser.role, IpAddress: req.ip },
    String(process.env.REFRESH_TOKEN_SECRET),
    "7d"
  );

  res.cookie(
    "accessToken",
    `${process.env.ACCESS_TOKEN_START_WITH}${accessToken}`,
    cokkiesOptions(3600000)
  );

  res.cookie("refreshToken", refreshToken, cokkiesOptions(7 * 24 * 3600000));
  return res
    .status(200)
    .json({ message: "Login successful", user: sanatizeUser(findUser) });
};

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.params.token;
  const payload = verifyToken(
    token.toString(),
    String(process.env.ACCESS_TOKEN_SECRET)
  );
  const userupdate = await userModel
    .updateOne({ _id: payload?.userId }, { $set: { isConfirmed: true } })
    .lean();

  if (userupdate.matchedCount === 0)
    return next(new CustomError("Error Please Try again later", 400));
  res
    .status(200)
    .json({ message: "confirmed", success: true, user: userupdate });
};

// export const updatedToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { refreshToken } = req.cookies;
//   console.log({ refreshToken });

//   if (!refreshToken) {
//     return next(new CustomError("Please provide both tokens", 400));
//   }

//   try {
//     // Verify refresh token if access token expired
//     const { userId, role } = verifyToken(
//       refreshToken,
//       String(process.env.SECRET_KEY)
//     );

//     // Generate a new access token
//     const newAccessToken = generateToken(
//       { userId, role, IpAddress: req.ip },
//       String(process.env.SECRET_KEY),
//       "1h"
//     );

//     res.cookie(
//       "accessToken",
//       `${process.env.ACCESS_TOKEN_START_WITH}${newAccessToken}`,
//       {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 3600000, // 1 hour
//         priority: "high",
//         path: "/",
//       }
//     );

//     // response
//     return res.status(200).json({
//       success: true,
//       message: "Token refreshed",
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     if (error instanceof TokenExpiredError) {
//       return next(new CustomError("Please log in again", 400));
//     } else {
//       return next(error);
//     }
//   }
// };

export const updatedToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken: accessTokenPrefix, refreshToken } = req.cookies;

  const accessToken = accessTokenPrefix.split(
    process.env.ACCESS_TOKEN_START_WITH
  )[1];

  try {
    // Verify the access token
    const decodedToken = verifyToken(
      accessToken,
      String(process.env.ACCESS_TOKEN_SECRET)
    );

    if (decodedToken && decodedToken.userId) {
      return res
        .status(200)
        .json({ message: "Token is already valid", success: true });
    }
  } catch (error: CustomError | Error | TokenExpiredError | any) {
    if (error.message === "Token verification failed: Token has expired") {
      try {
        // Verify refresh token if access token expired
        const { userId, role } = verifyToken(
          refreshToken,
          String(process.env.REFRESH_TOKEN_SECRET)
        );

        // Generate a new access token
        const newAccessToken = generateToken(
          { userId, role, IpAddress: req.ip },
          String(process.env.ACCESS_TOKEN_SECRET),
          "1h"
        );

        res.cookie(
          "accessToken",
          `${process.env.ACCESS_TOKEN_START_WITH}${newAccessToken}`,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Automatically true in production
            sameSite: "strict",
            maxAge: 3600000, // 1 hour
            priority: "high",
            path: "/",
          }
        );

        return res.status(200).json({
          success: true,
          message: "Token refreshed",
          accessToken: newAccessToken,
        });
      } catch (refreshError) {
        // Handle errors with the refresh token
        if (refreshError instanceof TokenExpiredError) {
          return next(new CustomError("Please log in again", 400));
        }
        // Handle any other errors
        return next(refreshError);
      }
    } else {
      // Throw error if token is not expired but invalid
      return next(error);
    }
  }
};
