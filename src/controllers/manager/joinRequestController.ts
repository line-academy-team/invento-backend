import { AuthRequest } from "../../middlewares/auth.ts";
import { Response } from "express";
import joinRequestService from "../../services/manager/joinRequestService.ts";
import { ProcessJoinRequestInputType } from "../../schemas/manager/organization/processJoinRequestSchema.ts";
import { z } from "zod";

const getJoinRequestList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const search = typeof req.query.search === "string" ? req.query.search : undefined;

        const joinRequest = await joinRequestService.getJoinRequestList(req.user.id, search);

        res.status(200).json({
            message: "조직 가입 요청 목록을 불러왔습니다.",
            data: joinRequest,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 요청을 처리할 권한이 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "가입 요청 목록 조회 중 오류가 발생했습니다." });
    }
};

const getJoinRequestById = async (req: AuthRequest<{ requesterId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const requesterId = Number(req.params.requesterId);
        if (isNaN(requesterId)) {
            res.status(400).json({ message: "유효하지 않은 요청 ID입니다." });
            return;
        }

        const joinRequest = await joinRequestService.getJoinRequestById(req.user.id, requesterId);
        res.status(200).json({
            message: "조직 가입 요청 상세 정보를 불러왔습니다.",
            data: joinRequest,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 요청을 처리할 권한이 없습니다." });
                return;
            }
            if (error.message === "JOIN_REQUEST_NOT_FOUND") {
                res.status(404).json({ message: "해당 가입 신청 내역을 찾을 수 없습니다." });
                return;
            }
            res.status(500).json({ message: "가입 요청 상세 조회 중 오류가 발생했습니다." });
        }
    }
};

const processJoinOrganization = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: ProcessJoinRequestInputType = req.body;

        await joinRequestService.processJoinOrganization(req.user.id, input);

        const statusMessage = input.status === "APPROVED" ? "승인" : "반려";
        res.status(200).json({
            message: `가입 요청 ${statusMessage} 처리가 완료되었습니다.`,
        });
    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: error.issues[0]?.message || "잘못된 데이터 요청입니다.",
            });
            return;
        }
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 요청을 처리할 권한이 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "가입 요청 처리 중 오류가 발생했습니다." });
    }
};

export default {
    getJoinRequestList,
    getJoinRequestById,
    processJoinOrganization,
};
