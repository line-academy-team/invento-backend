import { Router } from "express";
import departmentRouter from "./departmentRouter.ts";
import joinRequestRouter from "./joinRequestRouter.ts";
// 대시보드 라우터 임포트 추가
import managerDashboardRoute from "./managerDashboardRoute.ts";

const router = Router();

router.use("/department", departmentRouter);
router.use("/join", joinRequestRouter);

// 대시보드 라우터 연결 추가
router.use("/dashboard", managerDashboardRoute);

export default router;
