import joi from "joi";
import { generalFields } from "../../../middleware/validation";

export const sendMsgSchema = {
  body: joi
    .object({
      receiverId: generalFields._id.required(),
      message: joi.string().trim().min(1).max(333).required(),
    })
    .required(),
};

export const deleteMsgSchema = {
  params: joi
    .object({
      msgId: generalFields._id.required(),
    })
    .required(),
};

export const searchMsg = {
  query: joi
    .object({
      searchText: joi.string().min(1).max(100).required(),
    })
    .required(),
};
