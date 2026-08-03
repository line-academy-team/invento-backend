import { z } from "zod";

export const transferDepartmentSchema = z.object({
    memberIds: z.array(z.number({ message: "회원 ID는 숫자여야 합니다." })),
    targetDepartmentId: z.number({ message: "이동할 부서 ID는 숫자여야 합니다." }),
});

export type TransferDepartmentInput = z.infer<typeof transferDepartmentSchema>;

export const ownerDepartmentSchema = z.object({
    name: z.string().min(1, "부서명을 입력해주세요.").max(50, "부서명은 50자 이내여야 합니다."),
});

export type DepartmentInputType = z.infer<typeof ownerDepartmentSchema>;

export const assignDepartmentManagerSchema = z.object({
    memberId: z.number({ message: "회원 ID는 숫자여야 합니다." }),
});

export type AssignDepartmentManagerInputType = z.infer<typeof assignDepartmentManagerSchema>;
