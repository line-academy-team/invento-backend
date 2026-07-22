import { z } from "zod";

export const adminUpdateOrganizationSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    logoUrl: z.string().max(255).optional(),
    inviteCode: z.string().min(1).max(20).optional(),
});
export type AdminUpdateOrganizationInputType = z.infer<typeof adminUpdateOrganizationSchema>;
