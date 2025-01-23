import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import userModel from "../../../DB/models/user.model";

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req?.user;

    if (!user?.name || !user?._id || !req.file?.buffer) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const dirPath = path.join(
      process.cwd(),
      "uploads",
      "users",
      "images",
      `${user.name.replace(/\s+/g, "-")}-${user._id}`,
      "avatar"
    );

    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { force: true, recursive: true });
    }

    fs.mkdirSync(dirPath, { recursive: true });

    const imgName = `${req.file.originalname.replace(
      /\s+/g,
      "-"
    )}-avatar-${Date.now()}-${user.name.replace(/\s+/g, "-")}.png`;
    fs.writeFileSync(path.join(dirPath, imgName), req.file.buffer);

    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/users/images/${user.name.replace(/\s+/g, "-")}-${
      user._id
    }/avatar/${imgName}`;

    await userModel.updateOne({ _id: user._id }, { avatar: imageUrl });

    return res.status(201).json({
      success: true,
      message: "Avatar uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};
