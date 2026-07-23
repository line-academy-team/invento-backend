import { Router } from "express";
import { authenticate, requiredAdmin } from "../../../middlewares/auth.ts";
import { validate } from "../../../middlewares/validate.ts";
import { adminUpdateOrganizationSchema } from "../../../schemas/admin/organization/adminUpdateOrganizationSchema.ts";
import adminOrganizationController from "../../../controllers/admin/adminOrganizationController.ts";

const router = Router();

// 인증 및 어드민 권한 필수 적용
router.use(authenticate, requiredAdmin);

router.patch(
    "/:id",
    validate(adminUpdateOrganizationSchema),
    adminOrganizationController.updateOrganization,
);

export default router;
