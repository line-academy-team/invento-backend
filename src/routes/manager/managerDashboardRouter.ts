import managerDashboardController from "../../controllers/manager/managerDashboardController.ts";
import { authenticate } from "../../middlewares/auth.ts";
import { Router } from "express";

const router = Router();

router.get("/", authenticate, managerDashboardController.getDashboard);

export default router;
