import { z } from "zod";

export const adminCreateDepartmentSchema = z.object({
    organizationId: z.number().int("조직 ID를 입력해주세요."),
    name: z.string().min(1, "부서명을 입력해주세요.").max(50),
    description: z.string().optional(),
});
export type AdminCreateDepartmentInputType = z.infer<typeof adminCreateDepartmentSchema>;
