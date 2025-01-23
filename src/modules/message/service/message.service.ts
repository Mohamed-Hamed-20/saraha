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

  const userData = req.user;

  const user = await userModel.findById(new Types.ObjectId(receiverId));
  if (!user) return next(new CustomError("User Not found", 404));

  const createMsg = await messageModel.create({
    receiverId: receiverId,
    message: message,
    senderId: userData?._id ? userData._id : undefined,
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
  const user = req.user;
  const msgId = new Types.ObjectId(String(req.params.msgId));

  const findMsg = await messageModel.findOneAndDelete(
    { _id: msgId },
    { new: true }
  );

  if (!findMsg) return next(new CustomError("message not found", 404));
  if (!findMsg.receiverId.equals(user?._id))
    return next(new CustomError("Unauthorized to see this Message", 401));

  return res.status(200).json({
    success: true,
    message: "message deleted successfully",
    Msg: findMsg,
  });
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  const messages = await messageModel
    .find(
      {
        receiverId: new Types.ObjectId(user?._id),
      },
      {
        message: 1,
        senderId: 1,
      }
    )
    .sort({ updatedAt: -1 });

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
  const { searchText } = req.query;
  const user = req.user;
  const messages = await messageModel.find({
    $and: [
      { receiverId: user?._id },
      { $text: { $search: String(searchText) } },
    ],
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
  const user = req.user;
  const msgId = new Types.ObjectId(req.params.msgId);
  const message = await messageModel.findById(msgId);
  if (!message)
    return next(new CustomError("Invaild MessageId , not found", 404));

  if (!message.receiverId.equals(user?._id)) {
    return next(new CustomError("Unauthorized to see this Message", 401));
  }

  return res.status(200).json({
    success: true,
    message: "message finded successful",
    messageInfo: message,
  });
};
