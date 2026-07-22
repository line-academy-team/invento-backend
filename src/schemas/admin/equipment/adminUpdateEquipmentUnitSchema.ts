import { z } from "zod";
import { EquipmentStatus } from "../../../generated/prisma/enums.js";

export const adminUpdateEquipmentUnitSchema = z.object({
    assetNumber: z.string().min(1).max(50).optional(),
    status: z.enum(Object.values(EquipmentStatus) as [string, ...string[]]).optional(),
});
export type AdminUpdateEquipmentUnitInputType = z.infer<typeof adminUpdateEquipmentUnitSchema>;
