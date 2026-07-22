import { z } from "zod";
import { ReportType } from "../../generated/prisma/enums.ts";

export const userCreateReportSchema = z.object({
    equipmentId: z.number().int().optional(),
    type: z.enum(Object.values(ReportType) as [string, ...string[]]),
    title: z.string().min(1, "제목을 입력해주세요.").max(100),
    content: z.string().min(1, "내용을 입력해주세요."),
});
export type UserCreateReportInputType = z.infer<typeof userCreateReportSchema>;
