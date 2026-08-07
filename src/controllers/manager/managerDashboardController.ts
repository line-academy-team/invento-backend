import { Request, Response } from "express";
import managerDashboardService from "../../services/manager/managerDashboardService.ts";

const getDashboard = async (req: Request, res: Response) => {
    try {
        const organizationId = Number(req.params.organizationId);

        if (isNaN(organizationId)) {
            res.status(400).json({ message: "조직 아이디가 올바르지 않습니다." });
            return;
        }

        const dashboardData = await managerDashboardService.getDashboardData(organizationId);

        res.status(200).json({
            message: "매니저 대시보드 데이터를 성공적으로 조회했습니다.",
            data: dashboardData,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_ORGANIZATION") {
            res.status(404).json({ message: "해당 조직을 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getDashboard,
};
