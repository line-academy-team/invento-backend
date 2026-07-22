import { z } from "zod";
import { MemberRole, MemberStatus } from "../../../generated/prisma/enums.ts";

export const adminCreateMemberSchema = z.object({
    organizationId: z.number().int("조직 ID를 입력해주세요."),
    userId: z.number().int("사용자 ID를 입력해주세요."),
    departmentId: z.number().int().optional(),
    role: z.enum(Object.values(MemberRole) as [string, ...string[]]).optional(),
    status: z.enum(Object.values(MemberStatus) as [string, ...string[]]).optional(),
});
export type AdminCreateMemberInputType = z.infer<typeof adminCreateMemberSchema>;
