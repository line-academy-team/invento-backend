import type { Response } from "express";
import type { UserOrganizationInputType } from "../schemas/organization/userOrganizationSchema.js";
import organizationService from "../services/organizationService.js";
import type { OrganizationUpdateInput } from "../generated/prisma/models/Organization.js";
import type { AuthRequest } from "../middlewares/auth.js";
import type { UserJoinOrganizationInputType } from "../schemas/organization/userJoinOrganizationSchema.js";

const validateOwnerAndOrg = async (req: AuthRequest<{ id: string }>, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        return null;
    }

    const ozId = Number(req.params.id);
    if (isNaN(ozId)) {
        res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
        return null;
    }

    try {
        const org = await organizationService.getOrganizationById(ozId, req.user.id);
        if (org.createdBy !== req.user.id) {
            res.status(403).json({ message: "조직 관리 권한이 없습니다/" });
            return null;
        }
        return { ozId, org };
    } catch (error) {
        if (error instanceof Error && error.message === "ORGANIZATION_NOT_FOUND") {
            res.status(404).json({ message: "조직을 찾을 수 없습니다." });
            return null;
        }
        throw error;
    }
};

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
        const organization = await organizationService.getOrganizationById(ozId, req.user.id);
        res.status(200).json({
            message: "조직 정보를 성공적을 불러왔습니다.",
            data: organization,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ORGANIZATION_NOT_FOUND") {
                res.status(404).json({ message: "조직을 찾을 수 없습니다." });
                return;
            }
            if (error.message === "NOT_A_MEMBER_OF_ORGANIZATION") {
                res.status(403).json({ messge: "해당 단체의 멤버만 조회할 수 있습니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "조직 정보 불러오기 중 서버 에러가 발생했습니다." });
    }
};

const createOrganization = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: UserOrganizationInputType = req.body;

        const newOrg = await organizationService.createOrganization(req.user.id, input);

        res.status(201).json({
            message: "조직이 성공적으로 생성되었으며 대표자로 등록되었습니다.",
            data: newOrg,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "조직 생성 중 서버 에러가 발생했습니다." });
    }
};

const updateOrganization = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const validated = await validateOwnerAndOrg(req, res);
        if (!validated) return;

        const { name, description, logoUrl, inviteCode }: UserOrganizationInputType = req.body;
        const organizationData: OrganizationUpdateInput = {
            name: name ?? null,
            description: description ?? null,
            logoUrl: logoUrl ?? null,
            inviteCode: inviteCode ?? null,
        };

        const newOrg = await organizationService.updateOrganization(
            validated.ozId,
            organizationData,
        );
        res.status(201).json({
            message: "단체가 성공적으로 수정되었습니다.",
            data: newOrg,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "단체 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteOrganization = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const validated = await validateOwnerAndOrg(req, res);
        if (!validated) return;

        await organizationService.deleteOrganization(validated.ozId);
        res.status(200).json({
            message: "조직이 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "조직 삭제 중 서버 에러가 발생했습니다." });
    }
};

const joinOrganization = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: UserJoinOrganizationInputType = req.body;
        const newMember = await organizationService.joinOrganization(req.user.id, input);

        res.status(201).json({
            message: "단체 가입 신청이 완료되었습니다. 관리자 승인을 기다려주세요.",
            data: newMember,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_JOINED_ANY_ORGANIZATION") {
                res.status(409).json({
                    message: "이미 가입되어 있거나 승인 중인 단체가 있습니다.",
                });
                return;
            }
            if (error.message === "ORGANIZATION_NOT_FOUND") {
                res.status(404).json({ message: "올바르지 않은 초대 코드입니다." });
                return;
            }
            if (error.message === "INVALID_DEPARTMENT") {
                res.status(400).json({ message: "해당 단체에 존재하지 않는 부서입니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "단체 가입 신청 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    joinOrganization,
};
