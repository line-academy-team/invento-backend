import type { Request, Response } from "express";
import type { UserCreateOrganizationInputType } from "../schemas/organization/userCreateOrganizationSchema.js";
import organizationService from "../services/organizationService.js";
import type { OrganizationCreateInput } from "../generated/prisma/models/Organization.js";

const createOrganization = async (req: Request, res: Response) => {
    try {
        const { name, description, logoUrl, inviteCode }: UserCreateOrganizationInputType =
            req.body;

        const organizationData: OrganizationCreateInput = {
            name,
            description: description ?? null,
            logoUrl: logoUrl ?? null,
            inviteCode,
        };

        const newOrganization = await organizationService.createOrganization(organizationData);

        res.status(200).json({ newOrganization });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "조직을 생성하는 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createOrganization,
};
