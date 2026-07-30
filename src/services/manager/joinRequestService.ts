import { getMemberByUserId } from "../rentalService.ts";
import prisma from "../../config/prisma.ts";
import { ProcessJoinRequestInputType } from "../../schemas/manager/organization/processJoinRequestSchema.ts";
import { MemberStatus } from "../../generated/prisma/enums.ts";

const getJoinRequestList = async (userId: number, search?: string) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    return prisma.member.findMany({
        where: {
            organizationId: member.organizationId,
            ...(search && {
                user: {
                    OR: [{ name: { contains: search } }, { email: { contains: search } }],
                },
            }),
        },
        select: {
            id: true,
            status: true,
            createdAt: true,
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
        orderBy: { createdAt: "desc" },
    });
};

const getJoinRequestById = async (userId: number, requesterId: number) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    const [joinRequest, departments] = await Promise.all([
        prisma.member.findFirst({
            where: {
                id: requesterId,
                organizationId: member.organizationId,
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                organization: {
                    select: {
                        name: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.department.findMany({
            where: { organizationId: member.organizationId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
    ]);

    if (!joinRequest) {
        throw new Error("JOIN_REQUEST_NOT_FOUND");
    }

    return {
        ...joinRequest,
        departments,
    };
};

const processJoinOrganization = async (userId: number, input: ProcessJoinRequestInputType) => {
    const member = await getMemberByUserId(userId);

    if (!member || member.role === "MEMBER") {
        throw new Error("FORBIDDEN_APPROVAL");
    }

    return prisma.member.updateMany({
        where: {
            id: { in: input.memberIds },
            organizationId: member.organizationId,
            status: MemberStatus.PENDING,
        },
        data: {
            status: input.status === "APPROVED" ? MemberStatus.APPROVED : MemberStatus.REJECTED,
            approvedBy: member.id,
            approvedAt: new Date(),
            ...(input.status === "APPROVED" &&
                input.departmentId && { departmentId: input.departmentId }),
            ...(input.status === "APPROVED" && { joinedAt: new Date() }),
            ...(input.status === "REJECTED" &&
                input.rejectedReason && { rejectedReason: input.rejectedReason }),
        },
    });
};

export default {
    getJoinRequestList,
    getJoinRequestById,
    processJoinOrganization,
};
