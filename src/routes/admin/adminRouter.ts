import { Router } from "express";
import { authenticate, requiredAdmin } from "../../middleware/auth.ts";

const router = Router();

router.use(authenticate);
router.use(requiredAdmin);

// 어드민 생성 -> 유저로 가입 -> DataGrip에서 User.role 수정

// 어드민 로그인

// 사용자 목록 조회

// 사용자 상세 조회

// 계정 삭제 + 복구 -> updateUser

// 단체 정지 + 복구 -> updateOrganization

export default router;
