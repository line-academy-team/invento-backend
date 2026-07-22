import { z } from "zod";

export const userJoinOrganizationSchema = z.object({
    inviteCode: z.string().min(1, "초대 코드를 입력해주세요.").max(20),
    departmentId: z.number().int().optional(),
});
export type UserJoinOrganizationInputType = z.infer<typeof userJoinOrganizationSchema>;
