import { z } from "zod";
import { MemberStatus } from "../../../generated/prisma/enums.ts";

export const processJoinRequestSchema = z.object({
    memberIds: z.array(z.number({ message: "회원 ID는 숫자여야 합니다." })),
    status: z.enum([MemberStatus.APPROVED, MemberStatus.REJECTED], {
        message: "상태값은 APPROVED 또는 REJECTED만 가능합니다.",
    }),
    departmentId: z.number({ message: "부서 ID는 숫자여야 합니다." }).optional(),
    rejectedReason: z.string().max(255, "반려 사유는 255자 이내로 입력해주세요.").optional(),
});

export type ProcessJoinRequestInputType = z.infer<typeof processJoinRequestSchema>;
