import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { userReportSchema, userUpdateReportSchema } from "../schemas/report/userReportSchema.ts";
import reportController from "../controllers/reportController.ts";

const router = Router();

router.post(
    "/create",
    authenticate,
    validate(userReportSchema),
    reportController.createReportRequest,
);
router.get("/", authenticate, reportController.getReportList);
router.get("/:reportId", authenticate, reportController.getReportById);
router.patch(
    "/:reportId",
    authenticate,
    validate(userUpdateReportSchema),
    reportController.updateReport,
);
router.delete("/:reportId", authenticate, reportController.deleteReport);

export default router;
