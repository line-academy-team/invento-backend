import { z } from "zod";

export const userRequestStockSchema = z.object({
    equipmentId: z.number().int("장비 ID를 선택해주세요."),
    quantity: z.number().int().min(1, "요청 수량은 1 이상이어야 합니다."),
    reason: z.string().optional(),
});
export type UserRequestStockInputType = z.infer<typeof userRequestStockSchema>;
