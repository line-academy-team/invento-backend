import { Router } from "express";
import adminUserRouter from "./user/adminUserRouter.ts";
import adminOrganizationRouter from "./organization/adminOrganizationRouter.ts";

const adminRouter = Router();

// 어드민 생성 -> 유저로 가입 -> DataGrip에서 User.role 수정
// 어드민 로그인
// 사용자 목록 조회
// 사용자 상세 조회
// 계정 삭제 + 복구 -> updateUser
// 단체 정지 + 복구 -> updateOrganization

adminRouter.use("/user", adminUserRouter);
adminRouter.use("/organization", adminOrganizationRouter);

export default adminRouter;
