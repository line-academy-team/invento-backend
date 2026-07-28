import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import {
    createEquipmentUnitSchema,
    updateEquipmentUnitSchema,
} from "../schemas/manager/equipment/equipmentUnitSchema.ts";
import equipmentUnitController from "../controllers/equipmentUnitController.ts";

const router = Router();

router.get("/:equipmentId", authenticate, equipmentUnitController.getUnits);
router.post(
    "/",
    authenticate,
    validate(createEquipmentUnitSchema),
    equipmentUnitController.createUnit,
);
router.patch(
    "/:unitId",
    authenticate,
    validate(updateEquipmentUnitSchema),
    equipmentUnitController.updateUnit,
);
router.delete("/:unitId", authenticate, equipmentUnitController.deleteUnit);

export default router;
