import { Router } from "express";
import userController from "../controllers/userController.ts";
import { userSignupSchema } from "../schemas/user/userSignupSchema.ts";
import { loginSchema } from "../schemas/user/loginSchema.ts";
import { updateUserSchema } from "../schemas/user/updateUserSchema.ts";
import { withdrawUserSchema } from "../schemas/user/withdrawUserSchema.ts";
import { updatePasswordSchema } from "../schemas/user/updatePasswordSchema.ts";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";

const router = Router();

// 내 정보 조회
router.get("/me", authenticate, userController.getMe);

// 회원가입 및 로그인
router.post("/signup", validate(userSignupSchema), userController.createUser);
router.post("/login", validate(loginSchema), userController.login);

// 회원 정보 및 비밀번호 수정
router.patch("/update", authenticate, validate(updateUserSchema), userController.updateUser);
router.patch(
    "/password",
    authenticate,
    validate(updatePasswordSchema),
    userController.updatePassword,
);

// 회원 탈퇴 (소프트 삭제)
router.patch("/withdraw", authenticate, validate(withdrawUserSchema), userController.withdrawUser);

export default router;
