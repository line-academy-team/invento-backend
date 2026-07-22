import { z } from "zod";

export const updateUserSchema = z.object({
    name: z.string().min(1, "이름을 입력해주세요.").max(50).optional(),
});
export type UpdateUserInputType = z.infer<typeof updateUserSchema>;
