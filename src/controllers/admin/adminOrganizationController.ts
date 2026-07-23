import { Request, Response } from "express";
import { AdminUpdateOrganizationInputType } from "../../schemas/admin/organization/adminUpdateOrganizationSchema.ts";
import AdminOrganizationService from "../../services/admin/adminOrganizationService.ts";

const updateOrganization = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            res.status(400).send("아이디가 올바르지 않습니다.");
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

export default { updateOrganization };
