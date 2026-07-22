import { z } from "zod";

export const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
        newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다.").max(255),
        confirmPassword: z.string().min(1, "새 비밀번호 확인을 입력해주세요."),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
    });
export type UpdatePasswordInputType = z.infer<typeof updatePasswordSchema>;
