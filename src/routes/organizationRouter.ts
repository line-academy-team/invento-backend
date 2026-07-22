import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { userCreateOrganizationSchema } from "../schemas/organization/userCreateOrganizationSchema.js";
import organizationController from "../controllers/organizationController.js";

const router = Router();

router.post(
    "/create",
    validate(userCreateOrganizationSchema),
    organizationController.createOrganization,
);

export default router;
