import { Request, Response, NextFunction } from "express";
import userModel from "../../../DB/models/user.model";
import { Types } from "mongoose";
import { CustomError } from "../../../utils/errorHandling";
import messageModel from "../../../DB/models/message.model";
import * as express from "express";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { receiverId, message } = req.body;

  const { _id: senderId = undefined } = req.user as any;

  const user = await userModel.findById(new Types.ObjectId(receiverId));
  if (!user) return next(new CustomError("User Not found", 404));

  const createMsg = await messageModel.create({
    receivedId: user?._id,
    message: message,
    senderId: senderId ? senderId : undefined,
  });

  res.status(201).json({
    success: true,
    message: "message sended successfully",
    msg: createMsg,
  });
};

export const deleteMsg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: receiverId } = req.user as any;
  const msgId = String(req.query.msgId);

  const findMsg = await messageModel.findByIdAndDelete(
    {
      $and: [
        { _id: new Types.ObjectId(msgId) },
        { receiverId: new Types.ObjectId(receiverId) },
      ],
    },
    { new: true }
  );

  if (!findMsg) return next(new CustomError("message not found", 404));

  return res
    .status(200)
    .json({ success: true, message: "message deleted successfully" });
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userId } = req.user as any;

  const messages = await messageModel.find({
    receivedId: new Types.ObjectId(userId),
  });

  return res.status(200).json({
    success: true,
    message: "message returned successfully",
    messages,
  });
};

export const searchForMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search } = req.query;
  const { _id: userId } = req.user as any;

  const messages = await messageModel.find({
    $and: [{ receivedId: userId }, { $text: { $search: String(search) } }],
  });

  return res
    .status(200)
    .json({ success: true, message: "returned successfully", messages });
};

export const getMsgById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id: userId } = req.user as any;

  const messages = await messageModel.find({ receivedId: userId });

  return res
    .status(200)
    .json({ success: true, message: "data returned successful", messages });
};
