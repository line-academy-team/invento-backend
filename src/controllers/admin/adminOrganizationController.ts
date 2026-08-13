import { Request, Response } from "express";
import { AdminUpdateOrganizationInputType } from "../../schemas/admin/organization/adminUpdateOrganizationSchema.ts";
import AdminOrganizationService from "../../services/admin/adminOrganizationService.ts";

const getOrganizationList = async (req: Request, res: Response) => {
    try {
        const organizations = await AdminOrganizationService.getOrganizationList();
        res.status(200).json({
            message: "조직 목록을 조회했습니다.",
            data: organizations,
        });
    } catch (error) {
        res.status(500).json({ message: "조직 목록 조회 중 오류가 발생했습니다." });
    }
};

const getOrganizationById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const orgId = Number(req.params.id);
        if (isNaN(orgId)) {
            res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
            return;
        }

        const organization = await AdminOrganizationService.getOrganizationById(orgId);
        res.status(200).json({
            message: "조직 상세 정보를 조회했습니다.",
            data: organization,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "ORGANIZATION_NOT_FOUND") {
            res.status(404).json({ message: "조직을 찾을 수 없습니다." });
        }
        res.status(500).json({ message: "조직 상세 정보를 불러오는 중 오류가 발생했습니다." });
    }
};

const updateOrganization = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            res.status(400).json("아이디가 올바르지 않습니다.");
            return;
        }

        const input: AdminUpdateOrganizationInputType = req.body;
        const updateOrg = await AdminOrganizationService.updateOrganization(id, input);
        res.status(200).json({
            message: "단체 정보가 성공적으로 수정되었습니다.",
            data: updateOrg,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_ORGANIZATION") {
            res.status(404).json({
                message: "해당 단체를 찾을 수 없습니다.",
            });
            return;
        }
        res.status(500).json({
            message: "서버 에러가 발생했습니다.",
        });
    }
};

export default {
    getOrganizationList,
    getOrganizationById,
    updateOrganization,
};
