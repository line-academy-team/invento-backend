import { Router } from "express";
import departmentRouter from "./departmentRouter.ts";
import joinRequestRouter from "./joinRequestRouter.ts";

const router = Router();

router.use("/department", departmentRouter);
router.use("/join", joinRequestRouter);

export default router;
