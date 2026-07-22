import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);

        if (!result.success) {
            const errorMessage = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            res.status(400).json({ message: "잘못된 입력값입니다.", errors: errorMessage });
            return;
        }

        req.body = result.data;
        next();
    };
};
