import { RequestHandler, Router } from "express";
import * as messageServies from "./service/message.service";
import { valid } from "../../middleware/validation";
import * as schema from "./service/message.vaild";
import { asyncHandler } from "../../utils/errorHandling";
const router: Router = Router();

router.post(
  "/send/message",
  valid(schema.sendMsgSchema) as RequestHandler,
  asyncHandler(messageServies.sendMessage)
);

router.delete("/delete/message/:id", asyncHandler(messageServies.deleteMsg));

//gets
router.get(
  "/get/messages/:resiverId",
  asyncHandler(messageServies.getMessages)
);
router.get(
  "/search/messages/:resiverId",
  asyncHandler(messageServies.searchForMessage)
);
router.get("/get/message/:id", asyncHandler(messageServies.getMsgById));
export default router;
