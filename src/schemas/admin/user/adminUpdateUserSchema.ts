import { z } from "zod";
import { UserRole } from "../../../generated/prisma/client.ts"; // 실제 Prisma 생성 경로에 맞게 수정

export const adminUpdateUserSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요.").max(50).optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    isDeleted: z.boolean().optional(), // true: 계정 정지(삭제), false: 복구
});

export type AdminUpdateUserInputType = z.infer<typeof adminUpdateUserSchema>;
