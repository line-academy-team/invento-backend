import { z } from "zod";
import { RentalStatus } from "../../../generated/prisma/enums.js";

export const adminCreateRentalSchema = z.object({
    equipmentId: z.number().int("장비 ID를 입력해주세요."),
    equipmentUnitId: z.number().int().optional(),
    memberId: z.number().int("대여할 멤버 ID를 입력해주세요."),
    quantity: z.number().int().min(1).optional(),
    reason: z.string().max(255).optional(),
    status: z.enum(Object.values(RentalStatus) as [string, ...string[]]).optional(),
    dueAt: z.coerce.date().optional(),
});
export type AdminCreateRentalInputType = z.infer<typeof adminCreateRentalSchema>;
