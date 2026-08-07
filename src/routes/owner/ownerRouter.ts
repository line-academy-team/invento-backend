import { Router } from "express";
import ownerDepartmentRouter from "./ownerDepartmentRouter.ts";

const router = Router();

router.use("/department", ownerDepartmentRouter);

export default router;
