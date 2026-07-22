import { z } from "zod";

export const adminCreateOrganizationSchema = z.object({
    name: z.string().min(1, "조직명을 입력해주세요.").max(100),
    description: z.string().optional(),
    logoUrl: z.string().max(255).optional(),
    inviteCode: z.string().min(1, "초대 코드를 입력해주세요.").max(20),
    createdBy: z.number().int("생성자 ID를 입력해주세요."),
});
export type AdminCreateOrganizationInputType = z.infer<typeof adminCreateOrganizationSchema>;
