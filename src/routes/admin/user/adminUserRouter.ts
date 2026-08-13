import { Router } from "express";
import { loginSchema } from "../../../schemas/user/loginSchema.ts";
import { authenticate, requiredAdmin } from "../../../middlewares/auth.ts";
import { validate } from "../../../middlewares/validate.ts";
import adminUserController from "../../../controllers/admin/adminUserController.ts";
import { adminUpdateUserSchema } from "../../../schemas/admin/user/adminUpdateUserSchema.ts";

const router = Router();

router.post("/login", validate(loginSchema), adminUserController.login);

router.use(authenticate, requiredAdmin);

router.get("/", adminUserController.getUsers);
router.get("/:id", adminUserController.getUserById);
router.patch("/:id", validate(adminUpdateUserSchema), adminUserController.updateUser);

export default router;
