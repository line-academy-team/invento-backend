import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import {
    userRequestRentalSchema,
    userUpdateRentalSchema,
} from "../schemas/rental/userRequestRentalSchema.ts";
import rentalController from "../controllers/rentalController.ts";

const router = Router();

router.post(
    "/request",
    authenticate,
    validate(userRequestRentalSchema),
    rentalController.createRentalRequest,
);
router.get("/me", authenticate, rentalController.getMyRentalList);
router.get("/:ozId", authenticate, rentalController.getOrgRentalList);
router.patch("/return/:rentalId", authenticate, rentalController.returnRental);
router.patch(
    "/:rentalId",
    authenticate,
    validate(userUpdateRentalSchema),
    rentalController.updateRental,
);
router.delete("/:rentalId", authenticate, rentalController.deleteRental);

export default router;
