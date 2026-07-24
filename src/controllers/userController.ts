import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.ts";
import type { UserSignupInputType } from "../schemas/user/userSignupSchema.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import userService from "../services/userService.ts";
import type { LoginInputType } from "../schemas/user/loginSchema.ts";
import type { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";
import type { UpdatePasswordInputType } from "../schemas/user/updatePasswordSchema.ts";
import type { WithdrawUserInputType } from "../schemas/user/withdrawUserSchema.ts";

const getMe = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({
            message: "유효하지 않은 사용자이거나 탈퇴한 계정입니다.",
        });
        return;
    }

    try {
        // 인증 미들웨어를 통과한 유저의 전체 정보(소속 조직, 부서 포함)를 조회합니다.
        const authData = await userService.getUserWithMemberInfo(req.user.id);

        res.status(200).json({
            message: "사용자 정보 확인이 완료되었습니다.",
            data: authData, // { user, memberInfo } 형태로 반환됩니다.
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "사용자 정보 조회 중 오류가 발생했습니다." });
    }
};

const createUser = async (req: Request, res: Response) => {
    try {
        const input: UserSignupInputType = req.body;
        const hashedPassword = await passwordUtil.hashPassword(input.passwordHash);

        const userData = {
            email: input.email,
            passwordHash: hashedPassword,
            name: input.name,
        };

        const newUser = await userService.createUser(userData);

        res.status(201).json({
            message: "회원가입이 완료되었습니다.",
            data: newUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXISTS_EMAIL") {
                res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
                return;
            }
        }
        console.error(error);
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const loginData: LoginInputType = req.body;
        // userService.login() 의 리턴값은 이제 { user, memberInfo, token } 형태입니다.
        const result = await userService.login(loginData);

        res.status(200).json({
            message: "로그인에 성공했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
                return;
            }
        }
        console.error(error);
        res.status(500).json({ message: "로그인 처리 중 서버 에러가 발생했습니다." });
    }
};

const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;
        const input: UpdateUserInputType = req.body;
        const result = await userService.updateUser(userId, input);

        res.status(200).json({
            message: "회원 정보가 성공적으로 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_USER") {
            res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;
        const { currentPassword, newPassword }: UpdatePasswordInputType = req.body;

        await userService.updatePassword(userId, currentPassword, newPassword);

        res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_USER") {
                res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
                return;
            } else if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({ message: "현재 비밀번호가 일치하지 않습니다." });
                return;
            }
        }
        console.error(error);
        res.status(500).json({ message: "비밀번호 수정 중 서버 에러가 발생했습니다." });
    }
};

const withdrawUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "인증되지 않은 사용자입니다." });
            return;
        }

        const userId = req.user.id;
        const { password }: WithdrawUserInputType = req.body;

        await userService.withdrawUser(userId, password);

        res.status(200).json({ message: "회원 탈퇴가 성공적으로 처리되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_USER") {
                res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
                return;
            } else if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({ message: "현재 비밀번호가 일치하지 않습니다." });
                return;
            }
        }
        console.error(error);
        res.status(500).json({ message: "회원 탈퇴 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getMe,
    createUser,
    login,
    updateUser,
    updatePassword,
    withdrawUser,
};
