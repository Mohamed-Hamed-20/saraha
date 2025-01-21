import { Router } from "express";
import * as authServies from "./service/auth.service";
import { asyncHandler } from "../../utils/errorHandling";

const router: Router = Router();

router.post("/register", asyncHandler(authServies.register));
router.post("/login", asyncHandler(authServies.login));

export default router;
