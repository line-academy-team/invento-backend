import { z } from "zod";
import { EquipmentStatus } from "../../../generated/prisma/enums.ts";

export const adminCreateEquipmentUnitSchema = z.object({
    equipmentId: z.number().int("장비 ID를 입력해주세요."),
    assetNumber: z.string().min(1, "자산 번호를 입력해주세요.").max(50),
    status: z.enum(Object.values(EquipmentStatus) as [string, ...string[]]).optional(),
});
export type AdminCreateEquipmentUnitInputType = z.infer<typeof adminCreateEquipmentUnitSchema>;
