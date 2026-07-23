import { Router } from "express";
import { loginSchema } from "../../../schemas/user/loginSchema.ts";
import { authenticate, requiredAdmin } from "../../../middlewares/auth.ts";
import { validate } from "../../../middlewares/validate.ts";
import adminUserController from "../../../controllers/admin/adminUserController.ts";
import { adminUpdateUserSchema } from "../../../schemas/admin/user/adminUpdateUserSchema.ts";

const router = Router();

router.post("/login", validate(loginSchema), adminUserController.login);

// 인증 및 어드민 권한 필수 적용
router.use(authenticate, requiredAdmin);

router.get("/", adminUserController.getUsers);
router.get("/:id", adminUserController.getUserById);
router.patch("/:id", validate(adminUpdateUserSchema), adminUserController.updateUser);

export default router;
