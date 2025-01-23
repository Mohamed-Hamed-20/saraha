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
