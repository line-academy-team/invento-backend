import { z } from "zod";
import { ReportType } from "../../../generated/prisma/enums.ts";

const reportTypeValues = Object.values(ReportType) as [ReportType, ...ReportType[]];

export const processReportSchema = z.object({
    type: z.enum(reportTypeValues, { message: "올바른 보고 유형을 선택해주세요." }),
    result: z.string().trim().min(1, "답변 내용을 입력해주세요."),
});

export type ProcessReportInputType = z.infer<typeof processReportSchema>;
