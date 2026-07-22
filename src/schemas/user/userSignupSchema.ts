import { z } from "zod";

export const userSignupSchema = z.object({
    email: z.string().email("유효한 이메일 주소를 입력해주세요.").max(100),
    passwordHash: z.string().min(1, "비밀번호를 입력해주세요.").max(255),
    name: z.string().min(1, "이름을 입력해주세요.").max(50),
});
export type UserSignupInputType = z.infer<typeof userSignupSchema>;
