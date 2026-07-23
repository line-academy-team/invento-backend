import { LoginInputType } from "../../schemas/user/loginSchema.ts";
import { Request, Response } from "express";
import adminUserService from "../../services/admin/adminUserService.ts";
import { AdminUpdateUserInputType } from "../../schemas/admin/user/adminUpdateUserSchema.ts";

const login = async (req: Request, res: Response) => {
    try {
        const loginData: LoginInputType = req.body;
        const result = await adminUserService.login(loginData);
        res.status(200).json({ message: "어드민 로그인에 성공했습니다.", data: result });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
                return;
            } else if (error.message === "NOT_ADMIN") {
                res.status(403).json({ message: "어드민 권한이 없는 계정입니다." });
                return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminUserService.getUsers();
        res.status(200).json({ message: "사용자 목록을 성공적으로 조회했습니다.", data: users });
    } catch (error) {
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string, 10);
        const user = await adminUserService.getUserById(userId);
        res.status(200).json({
            message: "사용자 상세 정보를 성공적으로 조회했습니다.",
            data: user,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_USER") {
            res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updateUser = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            res.status(400).json("아이디가 올바르지 않습니다.");
            return;
        }

        const input: AdminUpdateUserInputType = req.body;
        const updateUser = await adminUserService.updateUser(id, input);
        res.status(200).json({
            message: "사용자 정보가 성공적으로 수정되었습니다",
            data: updateUser,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_USER") {
            res.status(404).json({ message: "해당 사용자를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    login,
    getUsers,
    getUserById,
    updateUser,
};
