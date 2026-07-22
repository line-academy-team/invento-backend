import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums.js";

export const adminCreateUserSchema = z.object({
    email: z.string().email("유효한 이메일 주소를 입력해주세요.").max(100),
    passwordHash: z.string().min(1, "비밀번호를 입력해주세요.").max(255),
    name: z.string().min(1, "이름을 입력해주세요.").max(50),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]),
});
export type AdminCreateUserInputType = z.infer<typeof adminCreateUserSchema>;
