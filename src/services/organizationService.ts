import prisma from "../config/prisma.js";
import type { OrganizationCreateInput } from "../generated/prisma/models/Organization.js";

const createOrganization = async (data: OrganizationCreateInput) => {
    const response = await prisma.organization.create({
        data,
    });

    return response;
};

export default { createOrganization };
