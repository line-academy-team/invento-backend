import { z } from "zod";
import { RequestStatus } from "../../../generated/prisma/enums.ts";

export const adminProcessStockRequestSchema = z.object({
    status: z.enum(Object.values(RequestStatus) as [string, ...string[]]),
    rejectedReason: z.string().max(255).optional(),
});
export type AdminProcessStockRequestInputType = z.infer<typeof adminProcessStockRequestSchema>;
