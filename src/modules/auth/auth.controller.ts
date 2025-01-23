import { RequestHandler, Router } from "express";
import * as authServies from "./service/auth.service";
import { asyncHandler } from "../../utils/errorHandling";
import { valid } from "../../middleware/validation";
import {
  confirmEmailSchema,
  loginSchema,
  registerSchema,
} from "./service/auth.vaild";
import { Schema } from "mongoose";

const router: Router = Router();

router.post(
  "/register",
  valid(registerSchema) as RequestHandler,
  asyncHandler(authServies.register)
);
router.post(
  "/login",
  valid(loginSchema) as RequestHandler,
  asyncHandler(authServies.login)
);
router.get(
  "/confirm/:token/email",
  valid(confirmEmailSchema) as RequestHandler,
  asyncHandler(authServies.confirmEmail)
);
router.post("/updated/tokens", asyncHandler(authServies.updatedToken));
export default router;
