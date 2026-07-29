import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import equipmentController from "../controllers/equipmentController.ts";
import {
    createEquipmentSchema,
    updateEquipmentSchema,
} from "../schemas/manager/equipment/equipmentSchema.ts";

const router = Router();

router.get("/", authenticate, equipmentController.getEquipmentList);
router.get("/:equipmentId", authenticate, equipmentController.getEquipmentById);
router.post(
    "/",
    authenticate,
    validate(createEquipmentSchema),
    equipmentController.createEquipment,
);
router.patch(
    "/:equipmentId",
    authenticate,
    validate(updateEquipmentSchema),
    equipmentController.updateEquipment,
);
router.delete("/:equipmentId", authenticate, equipmentController.deleteEquipment);

export default router;
