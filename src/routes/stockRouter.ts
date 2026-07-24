import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import stockController from "../controllers/stockController.ts";
import { validate } from "../middlewares/validate.ts";
import { userRequestStockSchema } from "../schemas/stock/userRequestStockSchema.ts";

const router = Router();

router.post(
    "/request",
    authenticate,
    validate(userRequestStockSchema),
    stockController.createStockRequest,
);
router.get("/me", authenticate, stockController.getMyStockList);
router.patch(
    "/:stockId",
    authenticate,
    validate(userRequestStockSchema),
    stockController.updateStockRequest,
);
router.delete("/:stockId", authenticate, stockController.deleteStockRequest);

export default router;
