import { z } from "zod";
import { UserRole } from "../../../generated/prisma/client.ts";

export const adminUpdateUserSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요.").max(50).optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
    isDeleted: z.boolean().optional(),
});

export type AdminUpdateUserInputType = z.infer<typeof adminUpdateUserSchema>;
