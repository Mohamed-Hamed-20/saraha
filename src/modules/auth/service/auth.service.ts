import express, { Request, Response, NextFunction } from "express";
import userModel from "../../../DB/models/user.model";
import { hashSync, compareSync } from "bcryptjs";
import { CustomError } from "../../../utils/errorHandling";
import emailQueue from "../../../utils/email.Queue";
import { SignUpTemplet } from "../../../utils/htmlTemplet";
import { encrypt } from "../../../utils/crpto";
import { sanatizeUser } from "../../../utils/sanatize.data";

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

  await emailQueue.add(
    {
      to: response.email,
      subject: "Sara7a Team",
      text: "Welcome to My Sara7a App! 🎉",
      html: SignUpTemplet("http://localhost:5000/"),
    },
    { attempts: 3, backoff: 5000, removeOnComplete: true, removeOnFail: true }
  );
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const findUser = await userModel
      .findOne({ email })
      .select("name email password age");

    if (!findUser) return next(new CustomError("Email doesn't exist", 404));

    const chkPassword: boolean = compareSync(
      password,
      String(findUser.password)
    );

    if (!chkPassword) return next(new CustomError("Invalid Password", 400));

    res
      .status(200)
      .json({ message: "Login successful", user: sanatizeUser(findUser) });
  } catch (error) {
    next(error);
  }
};
