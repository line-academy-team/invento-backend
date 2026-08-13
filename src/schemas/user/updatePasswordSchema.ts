import { z } from "zod";

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
    newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다.").max(255),
});
export type UpdatePasswordInputType = z.infer<typeof updatePasswordSchema>;
