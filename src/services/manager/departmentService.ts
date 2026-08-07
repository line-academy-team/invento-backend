import { TransferDepartmentInput } from "../../schemas/manager/department/departmentSchema.ts";
import { getMemberByUserId } from "../rentalService.ts";
import prisma from "../../config/prisma.ts";
import { MemberStatus } from "../../generated/prisma/enums.ts";

const getOrgMemberList = async (userId: number, search?: string) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    return prisma.member.findMany({
        where: {
            organizationId: member.organizationId,
            status: MemberStatus.APPROVED,
            ...(search && {
                OR: [
                    { user: { name: { contains: search } } },
                    { department: { name: { contains: search } } },
                ],
            }),
        },
        select: {
            id: true,
            role: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { user: { name: "asc" } },
    });
};

const getDepartmentById = async (userId: number, dpId: number) => {
    const member = await getMemberByUserId(userId);
    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    const department = await prisma.department.findUnique({
        where: { id: dpId },
        include: {
            members: {
                select: {
                    id: true,
                    role: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }

    if (department.organizationId !== member.organizationId) {
        throw new Error("FORBIDDEN_DEPARTMENT_VIEW");
    }

    return department;
};

const transferDepartment = async (userId: number, input: TransferDepartmentInput) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    const targetDepartment = await prisma.department.findFirst({
        where: {
            id: input.targetDepartmentId,
            organizationId: member.organizationId,
        },
    });

    if (!targetDepartment) {
        throw new Error("DEPARTMENT_NOT_FOUND");
    }

    return prisma.member.updateMany({
        where: {
            id: { in: input.memberIds },
            organizationId: member.organizationId,
            status: MemberStatus.APPROVED,
        },
        data: {
            departmentId: input.targetDepartmentId,
        },
    });
};

export default {
    getOrgMemberList,
    getDepartmentById,
    transferDepartment,
};
