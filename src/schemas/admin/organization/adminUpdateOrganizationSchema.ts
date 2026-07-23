import { z } from "zod";

export const adminUpdateOrganizationSchema = z.object({
    name: z.string().min(1, "조직명을 입력해주세요.").max(100).optional(),
    description: z.string().optional(),
    isSuspended: z.boolean().optional(), // true: 단체 정지, false: 복구
});

export type AdminUpdateOrganizationInputType = z.infer<typeof adminUpdateOrganizationSchema>;
