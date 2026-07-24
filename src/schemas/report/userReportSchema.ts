import { z } from "zod";
import { ReportType } from "../../generated/prisma/enums.ts";

const reportTypeValues = Object.values(ReportType) as [ReportType, ...ReportType[]];

export const userReportSchema = z.object({
    equipmentId: z.number().int().optional(),
    type: z.enum(reportTypeValues, { message: "올바른 보고 유형을 선택해주세요." }),
    title: z.string().min(1, "제목을 입력해주세요.").max(100),
    content: z.string().min(1, "내용을 입력해주세요."),
});
export type UserCreateReportInputType = z.infer<typeof userReportSchema>;

export const userUpdateReportSchema = userReportSchema
    .omit({
        equipmentId: true,
    })
    .partial();
export type UserUpdateReportInputType = z.infer<typeof userUpdateReportSchema>;
