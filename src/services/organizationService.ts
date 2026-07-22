import prisma from "../config/prisma.js";
import type {
    OrganizationCreateInput,
    OrganizationUpdateInput,
} from "../generated/prisma/models/Organization.js";

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
            equipment: true,
        },
    });

    if (!organization || organization.deletedAt) {
        throw new Error("ORGANIZATION_NOT_FOUND");
    }

    return organization;
};

const createOrganization = async (data: OrganizationCreateInput) => {
    return prisma.organization.create({
        data,
    });
};

const updateOrganization = async (ozId: number, input: OrganizationUpdateInput) => {};

export default {
    createOrganization,
    getOrganizationById,
    updateOrganization,
};
