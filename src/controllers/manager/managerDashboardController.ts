import { Response } from "express";
import managerDashboardService from "../../services/manager/managerDashboardService.ts";
import { AuthRequest } from "../../middlewares/auth.ts";

const getDashboard = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const dashboardData = await managerDashboardService.getDashboardData(req.user.id);

        res.status(200).json({
            message: "매니저 대시보드 데이터를 성공적으로 조회했습니다.",
            data: dashboardData,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "MANAGER_PERMISSION_REQUIRED") {
                res.status(403).json({ message: "대시보드 조회 권한이 없습니다." });
                return;
            }
            if (error.message === "NOT_FOUND_ORGANIZATION") {
                res.status(404).json({ message: "해당 조직을 찾을 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getDashboard,
};
