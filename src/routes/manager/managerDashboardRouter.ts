import { Router } from "express";
import departmentRouter from "./departmentRouter.ts";
import joinRequestRouter from "./joinRequestRouter.ts";
// 대시보드 라우터 임포트 추가
import managerDashboardController from "../../controllers/manager/managerDashboardController.ts";

const router = Router();

router.get("/:organizationId", managerDashboardController.getDashboard);

export default router;
