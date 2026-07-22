import { z } from "zod";
import { MemberRole, MemberStatus } from "../../../generated/prisma/enums.js";

export const adminUpdateMemberSchema = z.object({
    departmentId: z.number().int().nullable().optional(),
    role: z.enum(Object.values(MemberRole) as [string, ...string[]]).optional(),
    status: z.enum(Object.values(MemberStatus) as [string, ...string[]]).optional(),
    rejectedReason: z.string().max(255).optional(),
});
export type AdminUpdateMemberInputType = z.infer<typeof adminUpdateMemberSchema>;
