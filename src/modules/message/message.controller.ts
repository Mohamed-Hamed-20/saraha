import { RequestHandler, Router } from "express";
import * as messageServies from "./service/message.service";
import { valid } from "../../middleware/validation";
import * as schema from "./service/message.vaild";
import { asyncHandler } from "../../utils/errorHandling";
import { isAuth, Roles } from "../../middleware/auth";
import { cokkiesSchema } from "../auth/service/auth.vaild";
const router: Router = Router();

router.post(
  "/send/message",
  valid(schema.sendMsgSchema) as RequestHandler,
  asyncHandler(messageServies.sendMessage)
);

router.delete(
  "/delete/message/:msgId",
  valid(cokkiesSchema) as RequestHandler,
  valid(schema.deleteMsgSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.User]),
  asyncHandler(messageServies.deleteMsg)
);

// see all msg i get
router.get(
  "/get/messages",
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.User]),
  asyncHandler(messageServies.getMessages)
);
router.get(
  "/search/messages",
  valid(cokkiesSchema) as RequestHandler,
  valid(schema.searchMsg) as RequestHandler,
  isAuth([Roles.Admin, Roles.User]),
  asyncHandler(messageServies.searchForMessage)
);
router.get(
  "/get/message/:msgId",
  valid(cokkiesSchema) as RequestHandler,
  valid(schema.deleteMsgSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.User]),
  asyncHandler(messageServies.getMsgById)
);
export default router;
