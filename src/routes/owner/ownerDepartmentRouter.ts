import { Router } from "express";
import { authenticate } from "../../middlewares/auth.ts";
import ownerDepartmentController from "../../controllers/owner/ownerDepartmentController.ts";
import { validate } from "../../middlewares/validate.ts";
import {
    assignDepartmentManagerSchema,
    ownerDepartmentSchema,
} from "../../schemas/manager/department/departmentSchema.ts";

const router = Router();

router.get("/", authenticate, ownerDepartmentController.getDepartmentList);
router.post(
    "/create",
    authenticate,
    validate(ownerDepartmentSchema),
    ownerDepartmentController.createDepartment,
);
router.patch(
    "/:departmentId",
    authenticate,
    validate(ownerDepartmentSchema),
    ownerDepartmentController.updateDepartment,
);
router.delete("/:departmentId", authenticate, ownerDepartmentController.deleteDepartment);
router.patch(
    "/:departmentId/manager",
    authenticate,
    validate(assignDepartmentManagerSchema),
    ownerDepartmentController.assignDepartmentManager,
);

export default router;
