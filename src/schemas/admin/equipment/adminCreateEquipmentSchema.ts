import { z } from "zod";
import { EquipmentStatus, EquipmentType } from "../../../generated/prisma/enums.ts";

export const adminCreateEquipmentSchema = z.object({
    organizationId: z.number().int("조직 ID를 입력해주세요."),
    departmentId: z.number().int().optional(),
    name: z.string().min(1, "장비명을 입력해주세요.").max(100),
    category: z.string().max(50).optional(),
    description: z.string().optional(),
    imageUrl: z.string().max(255).optional(),
    type: z.enum(Object.values(EquipmentType) as [string, ...string[]]),
    totalQuantity: z.number().int().min(0, "수량은 0 이상이어야 합니다.").optional(),
    availableQuantity: z.number().int().min(0, "수량은 0 이상이어야 합니다.").optional(),
    status: z.enum(Object.values(EquipmentStatus) as [string, ...string[]]).optional(),
    createdBy: z.number().int("생성자 ID를 입력해주세요."),
});
export type AdminCreateEquipmentInputType = z.infer<typeof adminCreateEquipmentSchema>;
