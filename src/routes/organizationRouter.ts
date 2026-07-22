import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { userOrganizationSchema } from "../schemas/organization/userOrganizationSchema.js";
import organizationController from "../controllers/organizationController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/:id", authenticate, organizationController.getOrganizationById);
router.post(
    "/create",
    authenticate,
    validate(userOrganizationSchema),
    organizationController.createOrganization,
);

export default router;
