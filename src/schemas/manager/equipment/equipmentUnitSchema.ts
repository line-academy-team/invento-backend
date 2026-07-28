import { z } from "zod";

export const createEquipmentUnitSchema = z.object({
    equipmentId: z.number().int(),
    assetNumber: z.string().min(1, "자산 번호를 입력해주세요.").max(50),
    status: z.enum(["AVAILABLE", "BORROWED", "LOST", "BROKEN", "DISPOSED"]).optional(),
});

export const updateEquipmentUnitSchema = createEquipmentUnitSchema.partial();

export type CreateEquipmentUnitInputType = z.infer<typeof createEquipmentUnitSchema>;
export type UpdateEquipmentUnitInputType = z.infer<typeof updateEquipmentUnitSchema>;
