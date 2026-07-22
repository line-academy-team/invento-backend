import { z } from "zod";

export const userCreateOrganizationSchema = z.object({
    name: z.string().min(1, "조직명을 입력해주세요.").max(100),
    description: z.string().optional(),
    logoUrl: z.string().max(255).optional(),
});
export type UserCreateOrganizationInputType = z.infer<typeof userCreateOrganizationSchema>;
