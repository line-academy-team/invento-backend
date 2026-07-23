import { AdminUpdateOrganizationInputType } from "../../schemas/admin/organization/adminUpdateOrganizationSchema.ts";
import prisma from "../../config/prisma.ts";

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

export default { updateOrganization };
