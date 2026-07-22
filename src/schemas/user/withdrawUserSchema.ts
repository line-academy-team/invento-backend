import { z } from "zod";

export const withdrawUserSchema = z.object({
    password: z.string().min(1, "탈퇴를 위해 비밀번호를 입력해주세요."),
    reason: z.string().max(255).optional(),
});
export type WithdrawUserInputType = z.infer<typeof withdrawUserSchema>;
