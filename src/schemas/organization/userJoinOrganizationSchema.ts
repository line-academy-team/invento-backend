import { z } from "zod";

export const userJoinOrganizationSchema = z.object({
    inviteCode: z.string().min(1, "초대 코드를 입력해주세요.").max(20),
    department: z.string().min(1, "희망하거나 소속된 부서 이름을 입력해주세요").optional(),
});
export type UserJoinOrganizationInputType = z.infer<typeof userJoinOrganizationSchema>;
