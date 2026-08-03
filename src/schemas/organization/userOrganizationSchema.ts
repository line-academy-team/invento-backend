import { z } from "zod";

export const userOrganizationSchema = z.object({
    name: z.string().min(1, "조직명을 입력해주세요.").max(100),
    description: z.string().max(500, "소개글은 최대 500자 입니다.").optional(),
    logoUrl: z.string().max(255).optional(),
});
export type UserOrganizationInputType = z.infer<typeof userOrganizationSchema>;
