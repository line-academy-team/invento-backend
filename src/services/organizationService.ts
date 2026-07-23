import prisma from "../config/prisma.js";
import type { OrganizationUpdateInput } from "../generated/prisma/models/Organization.js";
import { MemberRole, MemberStatus } from "../generated/prisma/enums.js";
import type { UserOrganizationInputType } from "../schemas/organization/userOrganizationSchema.js";

const getOrganizationById = async (ozId: number, userId: number) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: ozId,
            deletedAt: null,
        },
        include: {
            departments: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
            members: {
                where: {
                    status: {
                        in: ["PENDING", "APPROVED"],
                    },
                },
                select: {
                    id: true,
                    userId: true,
                    role: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            equipments: true,
        },
    });

    if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");

    const isMember = organization.members.some(member => member.userId === userId);

    if (!isMember) {
        throw new Error("NOT_A_MEMBER_OF_ORGANIZATION");
    }

    return organization;
};

const createOrganization = async (userId: number, data: UserOrganizationInputType) => {
    return prisma.organization.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            logoUrl: data.logoUrl ?? null,
            inviteCode: data.inviteCode,
            creator: {
                connect: {
                    id: userId,
                },
            },
            members: {
                create: {
                    userId: userId,
                    role: MemberRole.OWNER,
                    status: MemberStatus.APPROVED,
                    joinedAt: new Date(),
                },
            },
        },
        include: {
            members: true,
        },
    });
};

const updateOrganization = async (ozId: number, data: OrganizationUpdateInput) => {
    return prisma.organization.update({
        where: {
            id: ozId,
        },
        data,
    });
};

const deleteOrganization = async (ozId: number) => {
    return prisma.organization.update({
        where: {
            id: ozId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

const joinOrganization = async (
    userId: number,
    data: { inviteCode: string; departmentId?: number | undefined },
) => {
    const existingAnyMember = await prisma.member.findFirst({
        where: {
            userId,
            status: {
                in: [MemberStatus.PENDING, MemberStatus.APPROVED],
            },
        },
        include: {
            organization: {
                select: { name: true },
            },
        },
    });

    if (existingAnyMember) throw new Error("ALREADY_JOINED_ANY_ORGANIZATION");

    const organization = await prisma.organization.findUnique({
        where: { inviteCode: data.inviteCode, deletedAt: null },
    });

    if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");

    if (data.departmentId) {
        const department = await prisma.department.findFirst({
            where: {
                id: data.departmentId,
                organizationId: organization.id,
            },
        });

        if (!department) throw new Error("INVALID_DEPARTMENT");
    }

    return prisma.member.create({
        data: {
            organizationId: organization.id,
            userId,
            departmentId: data.departmentId ?? null,
            role: MemberRole.MEMBER,
            status: MemberStatus.PENDING,
            include: {
                organization: {
                    select: {
                        id: true,
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
        },
    });
};

export default {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    joinOrganization,
};
