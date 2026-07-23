import prisma from "../config/prisma.js";
import type { OrganizationUpdateInput } from "../generated/prisma/models/Organization.js";
import { MemberRole, MemberStatus } from "../generated/prisma/enums.js";
import type { UserOrganizationInputType } from "../schemas/organization/userOrganizationSchema.js";

const getOrganizationById = async (ozId: number) => {
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
            members: true,
            equipments: true,
        },
    });

    if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");
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

export default {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
};
