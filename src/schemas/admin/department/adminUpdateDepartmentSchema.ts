import { z } from "zod";

export const adminUpdateDepartmentSchema = z.object({
    name: z.string().min(1, "부서명을 입력해주세요.").max(50).optional(),
    description: z.string().optional(),
});

export type AdminUpdateDepartmentInputType = z.infer<typeof adminUpdateDepartmentSchema>;
