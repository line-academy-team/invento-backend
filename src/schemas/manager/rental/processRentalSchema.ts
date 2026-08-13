import { z } from "zod";

export const processRentalSchema = z
    .object({
        status: z.enum(["BORROWED", "REJECTED"]),
        rejectedReason: z.string().max(255).optional(),
    })
    .refine(input => input.status !== "REJECTED" || Boolean(input.rejectedReason?.trim()), {
        message: "반려 사유를 입력해주세요.",
        path: ["rejectedReason"],
    });

export type ProcessRentalInputType = z.infer<typeof processRentalSchema>;
