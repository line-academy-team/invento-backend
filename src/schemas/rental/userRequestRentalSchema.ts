import { z } from "zod";

export const userRequestRentalSchema = z.object({
    equipmentId: z.number().int("장비 ID를 선택해주세요."),
    equipmentUnitId: z.number().int().optional(),
    quantity: z.number().int().min(1, "대여 수량은 1 이상이어야 합니다.").optional(),
    reason: z.string().max(255, "대여 사유를 작성해주세요.").optional(),
    dueAt: z.coerce.date().optional(),
});
export type UserRequestRentalInputType = z.infer<typeof userRequestRentalSchema>;
