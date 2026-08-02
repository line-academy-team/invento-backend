import { getMemberByUserId } from "../rentalService.ts";
import prisma from "../../config/prisma.ts";
import {
    AssignDepartmentManagerInputType,
    DepartmentInputType,
} from "../../schemas/manager/department/departmentSchema.ts";

const getDepartmentList = async (userId: number) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    return prisma.department.findMany({
        where: {
            organizationId: member.organizationId,
        },
        include: {
            members: {
                select: {
                    id: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
};

const createDepartment = async (userId: number, input: DepartmentInputType) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role !== "OWNER") {
        throw new Error("FORBIDDEN_OWNER_ONLY");
    }

    return prisma.department.create({
        data: {
            organizationId: member.organizationId,
            name: input.name,
        },
    });
};

const updateDepartment = async (userId: number, dpId: number, input: DepartmentInputType) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role !== "OWNER") {
        throw new Error("FORBIDDEN_OWNER_ONLY");
    }

    return prisma.department.update({
        where: {
            id: dpId,
            organizationId: member.organizationId,
        },
        data: {
            name: input.name,
        },
    });
};

const deleteDepartment = async (userId: number, dpId: number) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role !== "OWNER") {
        throw new Error("FORBIDDEN_OWNER_ONLY");
    }

    return prisma.$transaction([
        prisma.member.updateMany({
            where: { departmentId: dpId },
            data: { departmentId: null },
        }),
        prisma.department.delete({
            where: {
                id: dpId,
                organizationId: member.organizationId,
            },
        }),
    ]);
};

const assignDepartmentManager = async (
    userId: number,
    dpId: number,
    input: AssignDepartmentManagerInputType,
) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role !== "OWNER") {
        throw new Error("FORBIDDEN_OWNER_ONLY");
    }

    const targetMember = await prisma.member.findFirst({
        where: {
            id: input.memberId,
            organizationId: member.organizationId,
            departmentId: dpId,
        },
    });

    if (!targetMember) {
        throw new Error("MEMBER_NOT_IN_DEPARTMENT");
    }

    return prisma.$transaction([
        prisma.member.updateMany({
            where: {
                departmentId: dpId,
                role: "MANAGER",
            },
            data: {
                role: "MEMBER",
            },
        }),
        prisma.member.update({
            where: {
                id: input.memberId,
            },
            data: {
                role: "MANAGER",
            },
        }),
    ]);
};

export default {
    getDepartmentList,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignDepartmentManager,
};
