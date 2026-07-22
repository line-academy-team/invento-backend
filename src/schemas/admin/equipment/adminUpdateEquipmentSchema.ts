import { z } from "zod";
import { EquipmentStatus } from "../../../generated/prisma/enums.js";

export const adminUpdateEquipmentSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    departmentId: z.number().int().nullable().optional(),
    category: z.string().max(50).optional(),
    description: z.string().optional(),
    imageUrl: z.string().max(255).optional(),
    status: z.enum(Object.values(EquipmentStatus) as [string, ...string[]]).optional(),
});
export type AdminUpdateEquipmentInputType = z.infer<typeof adminUpdateEquipmentSchema>;
