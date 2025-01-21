import { Router } from "express";
import messageRouter from "./modules/auth/auth.controller";
import authRouter from "./modules/auth/auth.controller";
import userRouter from "./modules/user/user.controller";
const router: Router = Router();

router.use("/message", messageRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;
