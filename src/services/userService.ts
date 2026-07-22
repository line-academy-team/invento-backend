import prisma from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { LoginInputType } from "../schemas/user/loginSchema.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import type { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";

// 회원가입 로직

const createUser = async (data: { email: string; passwordHash: string; name: string }) => {
    try {
        return await prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;
                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
            }
        }
        throw new Error("UNKNOWN_ERROR");
    }
};

// 미들웨어용 유저 조회 로직
const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
};

// 로그인 로직
const login = async (data: LoginInputType) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // DB의 passwordHash 필드와 입력받은 password 비교
    const isValid = await passwordUtil.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwtUtil.generateToken(user.id);

    const { passwordHash, deletedAt, ...safeUserInfo } = user;
    return {
        user: safeUserInfo,
        token,
    };
};

// 유저 정보 수정 로직 (현재 스키마 기준 name만 수정 가능)
const updateUser = async (userId: number, input: UpdateUserInputType) => {
    const existUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existUser || existUser.deletedAt) {
        throw new Error("NOT_FOUND_USER");
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            // input.name이 존재할 때만 name 프로퍼티를 객체에 포함시킵니다.
            ...(input.name !== undefined && { name: input.name }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            updatedAt: true,
        },
    });
};

// 비밀번호 수정 로직
const updatePassword = async (userId: number, currentPw: string, newPw: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || user.deletedAt) {
        throw new Error("NOT_FOUND_USER");
    }

    const isPasswordValid = await passwordUtil.verifyPassword(currentPw, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    const hashedPassword = await passwordUtil.hashPassword(newPw);

    return prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash: hashedPassword,
        },
    });
};

// 회원 탈퇴 (소프트 삭제) 로직
const withdrawUser = async (userId: number, password: string) => {
    const existUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existUser || existUser.deletedAt) {
        throw new Error("NOT_FOUND_USER");
    }

    const isPasswordValid = await passwordUtil.verifyPassword(password, existUser.passwordHash);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            deletedAt: new Date(),
        },
    });
};

export default {
    createUser,
    getUserById,
    login,
    updateUser,
    updatePassword,
    withdrawUser,
};
