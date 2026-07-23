import { Router } from "express";

const router = Router();

router.post("/create");
router.get("/:orgId");
router.get("/:rentalId");
router.patch("/:rentalId");
router.delete("/:rentalId");

export default router;
