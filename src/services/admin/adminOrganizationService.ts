import { AdminUpdateOrganizationInputType } from "../../schemas/admin/organization/adminUpdateOrganizationSchema.ts";
import prisma from "../../config/prisma.ts";

const getOrganizationList = async () => {
    return prisma.organization.findMany({
        where: {
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            inviteCode: true,
            createdBy: true,
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            _count: {
                select: {
                    members: true,
                    equipments: true,
                },
            },
        },
    });
};

const getOrganizationById = async (orgId: number) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: orgId,
        },
        select: {
            id: true,
            name: true,
            description: true,
            logoUrl: true,
            inviteCode: true,
            createdBy: true,
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            _count: {
                select: {
                    members: true,
                    equipments: true,
                },
            },
        },
    });

    if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");

    return organization;
};

const updateOrganization = async (orgId: number, input: AdminUpdateOrganizationInputType) => {
    const existOrg = await prisma.organization.findUnique({
        where: { id: orgId },
    });

    if (!existOrg) throw new Error("NOT_FOUND_ORGANIZATION");

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    if (input.isSuspended === true) {
        updateData.deletedAt = new Date();
    } else if (input.isSuspended === false) {
        updateData.deletedAt = null;
    }

    return prisma.organization.update({
        where: { id: orgId },
        data: updateData,
    });
};

export default {
    getOrganizationList,
    getOrganizationById,
    updateOrganization,
};
