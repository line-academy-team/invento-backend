import { Router } from "express";
import { authenticate } from "../../middlewares/auth.ts";
import departmentController from "../../controllers/manager/departmentController.ts";
import { validate } from "../../middlewares/validate.ts";
import { transferDepartmentSchema } from "../../schemas/manager/department/departmentSchema.ts";

const router = Router();

router.get("/", authenticate, departmentController.getOrgMemberList);
router.get("/:departmentId", authenticate, departmentController.getDepartmentById);
router.patch(
    "/transfer",
    authenticate,
    validate(transferDepartmentSchema),
    departmentController.transferDepartment,
);

export default router;
