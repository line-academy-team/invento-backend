import { z } from "zod";

export const createEquipmentSchema = z.object({
    organizationId: z.number().int().optional(),
    departmentId: z.number().int().nullable().optional(),
    name: z.string().min(1, "장비명을 입력해주세요.").max(100),
    category: z.string().max(50).nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().max(255).nullable().optional(),
    type: z.enum(["INDIVIDUAL", "CONSUMABLE"]),
    totalQuantity: z.number().int().nonnegative(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export type CreateEquipmentInputType = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInputType = z.infer<typeof updateEquipmentSchema>;
