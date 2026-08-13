import { Router } from "express";
import adminUserRouter from "./user/adminUserRouter.ts";
import adminOrganizationRouter from "./organization/adminOrganizationRouter.ts";

const adminRouter = Router();

adminRouter.use("/user", adminUserRouter);
adminRouter.use("/organization", adminOrganizationRouter);

export default adminRouter;
