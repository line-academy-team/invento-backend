import { Router } from "express";
import { authenticate } from "../middlewares/auth.ts";
import stockController from "../controllers/stockController.ts";

const router = Router();

router.post("/request", authenticate, stockController.createStockRequest);
router.get("/me", authenticate, stockController.getMyStockList);
router.patch("/:stockId", authenticate, stockController.updateStockRequest);
router.delete("/:stockId", authenticate, stockController.deleteStockRequest);

export default router;
