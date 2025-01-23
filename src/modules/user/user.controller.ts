import { RequestHandler, Router } from "express";
import { configureMulter } from "../../utils/multer";
import { FileType } from "../../utils/files.allowed";
import * as userServies from "./service/user.service";
import { isAuth, Roles } from "../../middleware/auth";
import { valid } from "../../middleware/validation";
import { cokkiesSchema } from "../auth/service/auth.vaild";
import { asyncHandler } from "../../utils/errorHandling";

const router: Router = Router();

router.post(
  "/upload/avater",
  configureMulter(undefined, FileType.Images).single("avater"),
  valid(cokkiesSchema) as RequestHandler,
  isAuth([Roles.Admin, Roles.User]),
  asyncHandler(userServies.uploadAvatar)
);

export default router;
