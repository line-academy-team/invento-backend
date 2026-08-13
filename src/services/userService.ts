import prisma from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { LoginInputType } from "../schemas/user/loginSchema.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import type { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";

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

const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
};

const getUserWithMemberInfo = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            member: {
                include: {
                    organization: true,
                    department: true,
                },
            },
        },
    });

    if (!user || user.deletedAt) {
        throw new Error("USER_NOT_FOUND");
    }

    const { passwordHash, deletedAt, member, ...safeUserInfo } = user;

    const memberInfo = member
        ? {
              id: member.id,
              organizationId: member.organizationId,
              organizationName: member.organization?.name,
              departmentId: member.departmentId,
              departmentName: member.department?.name,
              role: member.role,
              status: member.status,
              joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
          }
        : null;

    return {
        user: safeUserInfo,
        memberInfo,
    };
};

const login = async (data: LoginInputType) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
            member: {
                include: {
                    organization: true,
                    department: true,
                },
            },
        },
    });

    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await passwordUtil.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwtUtil.generateToken(user.id);
    const { passwordHash, deletedAt, member, ...safeUserInfo } = user;

    const memberInfo = member
        ? {
              id: member.id,
              organizationId: member.organizationId,
              organizationName: member.organization?.name,
              departmentId: member.departmentId,
              departmentName: member.department?.name,
              role: member.role,
              status: member.status,
              joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
          }
        : null;

    return {
        user: safeUserInfo,
        memberInfo,
        token,
    };
};

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
            ...(input.name !== undefined && { name: input.name }),
            ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        },
        select: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
            updatedAt: true,
        },
    });
};

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
    getUserWithMemberInfo,
    login,
    updateUser,
    updatePassword,
    withdrawUser,
};
