import { Router } from "express";
import { authenticate } from "../../middlewares/auth.ts";
import joinController from "../../controllers/manager/joinRequestController.ts";

const router = Router();

router.get("/", authenticate, joinController.getJoinRequestList);
router.get("/:requesterId", authenticate, joinController.getJoinRequestById);
router.patch("/process", authenticate, joinController.processJoinOrganization);

export default router;
