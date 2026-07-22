import { Router } from "express";
import { authenticate, requiredAdmin } from "../../middleware/auth.ts";

const router = Router();

router.use(authenticate);
router.use(requiredAdmin);

export default router;
