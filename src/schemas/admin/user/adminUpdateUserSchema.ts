import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums.ts";

export const adminUpdateUserSchema = z.object({
    email: z.string().email().max(100).optional(),
    name: z.string().min(1).max(50).optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
});
export type AdminUpdateUserInputType = z.infer<typeof adminUpdateUserSchema>;
