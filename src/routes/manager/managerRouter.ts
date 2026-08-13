import { Router } from "express";
import departmentRouter from "./departmentRouter.ts";
import joinRequestRouter from "./joinRequestRouter.ts";
import managerDashboardRouter from "./managerDashboardRouter.ts";

const router = Router();

router.use("/department", departmentRouter);
router.use("/join", joinRequestRouter);
router.use("/dashboard", managerDashboardRouter);

export default router;
