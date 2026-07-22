import { z } from "zod";
import { RentalStatus } from "../../../generated/prisma/enums.ts";

export const adminUpdateRentalSchema = z.object({
    status: z.enum(Object.values(RentalStatus) as [string, ...string[]]),
    equipmentUnitId: z.number().int().optional(),
    rejectedReason: z.string().max(255).optional(),
    dueAt: z.coerce.date().optional(),
});
export type AdminUpdateRentalInputType = z.infer<typeof adminUpdateRentalSchema>;
