import prisma from "../../config/prisma.ts";
import { LoginInputType } from "../../schemas/user/loginSchema.ts";
import passwordUtil from "../../utils/password/passwordUtil.ts";
import jwtUtil from "../../utils/jwt/jwtUtil.ts";
import { AdminUpdateUserInputType } from "../../schemas/admin/user/adminUpdateUserSchema.ts";

const login = async (data: LoginInputType) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (!user || user.deletedAt) throw new Error("INVALID_CREDENTIALS");
    if (user.role !== "ADMIN") throw new Error("NOT_ADMIN");

    const isValid = await passwordUtil.verifyPassword(data.password, user.passwordHash);
    if (!isValid) throw new Error("INVALID_CREDENTIALS");

    const token = jwtUtil.generateToken(user.id);
    const { passwordHash, deletedAt, ...safeUserInfo } = user;

    return { user: safeUserInfo, token };
};

const getUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            deletedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

const getUserById = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            createdOrganizations: true,
            member: true,
        },
    });
    if (!user) throw new Error("NOT_FOUND_USER");
    return user;
};

const updateUser = async (userId: number, input: AdminUpdateUserInputType) => {
    const existUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existUser) throw new Error("NOT_FOUND_USER");

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.role !== undefined) updateData.role = input.role;

    if (input.isDeleted === true) {
        updateData.deletedAt = new Date();
    } else if (input.isDeleted === false) {
        updateData.deletedAt = null;
    }
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            deletedAt: true,
            updatedAt: true,
        },
    });
};

export default {
    login,
    getUsers,
    getUserById,
    updateUser,
};
