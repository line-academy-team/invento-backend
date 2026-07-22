import type { Response } from "express";
import type { UserOrganizationInputType } from "../schemas/organization/userOrganizationSchema.js";
import organizationService from "../services/organizationService.js";
import type { OrganizationCreateInput } from "../generated/prisma/models/Organization.js";
import type { AuthRequest } from "../middlewares/auth.js";

const getOrganizationById = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }
        const ozId = Number(req.params.id);
        if (isNaN(ozId)) {
            res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
            return;
        }
        const organization = await organizationService.getOrganizationById(ozId);
        res.status(200).json({
            message: "조직 정보를 성공적을 불러왔습니다.",
            data: organization,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "조직 정보를 불러오는 중 서버 에러가 발생했습니다.",
        });
    }
};

const createOrganization = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }

        const { name, description, logoUrl, inviteCode }: UserOrganizationInputType = req.body;

        const organizationData: OrganizationCreateInput = {
            name,
            description: description ?? null,
            logoUrl: logoUrl ?? null,
            inviteCode,
            creator: {
                connect: {
                    id: user.id,
                },
            },
        };

        const newOrganization = await organizationService.createOrganization(organizationData);

        res.status(200).json({
            message: "조직이 성공적으로 생성되었습니다.",
            data: newOrganization,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "조직을 생성하는 중 서버 에러가 발생했습니다." });
    }
};

const updateOrganization = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const ozId = Number(req.params.id);
        if (isNaN(ozId)) {
            res.status(404).json({
                message: "유효하지 않은 조직 ID입니다.",
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }
        const userId = req.user.id;

        const organization = await organizationService.getOrganizationById(ozId);

        const { name, description, logoUrl, inviteCode }: UserOrganizationInputType = req.body;
    } catch (error) {
        console.log(error);
    }
};

export default {
    createOrganization,
    getOrganizationById,
    updateOrganization,
};
