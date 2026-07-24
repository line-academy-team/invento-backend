import { AuthRequest } from "../middlewares/auth.ts";
import { Response } from "express";
import {
    UserCreateReportInputType,
    UserUpdateReportInputType,
} from "../schemas/report/userReportSchema.ts";
import reportService from "../services/reportService.ts";

const createReportRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: UserCreateReportInputType = req.body;
        const report = await reportService.createReport(req.user.id, input);

        res.status(201).json({
            message: "보고 전송이 완료되었습니다. 관리자 승인을 대기해주세요.",
            data: report,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "보고 전송 중 서버 에러가 발생했습니다.",
        });
    }
};

const getReportList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const ozId = req.query.ozId ? Number(req.query.ozId) : undefined;

        if (ozId !== undefined && isNaN(ozId)) {
            res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
            return;
        }

        const reports = await reportService.getReportList(req.user.id, ozId);
        res.status(200).json({
            message: ozId ? "조직 보고 목록을 불러왔습니다." : "내 보고 목록을 불러왔습니다.",
            data: reports,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "MEMBER_NOT_FOUND") {
                res.status(403).json({ message: "소속된 단체 멤버 정보를 찾을 수 없습니다." });
                return;
            }
            if (error.message === "NOT_A_MEMBER_OF_ORGANIZATION") {
                res.status(403).json({ message: "해당 조직의 멤버만 조회할 수 있습니다." });
                return;
            }
        }

        res.status(500).json({
            message: "내 보고 전송 목록을 불러오는 중 서버 에러가 발생했습니다.",
        });
    }
};

const getReportById = async (req: AuthRequest<{ reportId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const reportId = Number(req.params.reportId);
        if (isNaN(reportId)) {
            res.status(400).json({ message: "유효하지 않은 보고 ID입니다." });
            return;
        }

        const report = await reportService.getReportById(req.user.id, reportId);
        res.status(200).json({
            message: "보고 내용을 불러왔습니다.",
            data: report,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "NOT_A_MEMBER_OF_ORGANIZATION") {
            res.status(403).json({ message: "해당 조직의 멤버만 조회할 수 있습니다." });
            return;
        }
        res.status(500).json({ message: "보고 내용을 불러오는 중 서버 에러가 발생했습니다." });
    }
};

const updateReport = async (req: AuthRequest<{ reportId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const reportId = Number(req.params.reportId);
        if (isNaN(reportId)) {
            res.status(400).json({ message: "유효하지 않은 보고 ID입니다." });
            return;
        }

        const input: UserUpdateReportInputType = req.body;
        const updatedReport = await reportService.updateReport(req.user.id, reportId, input);

        res.status(200).json({
            message: "보고 수정이 완료되었습니다.",
            data: updatedReport,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "REPORT_NOT_FOUND") {
                res.status(400).json({
                    message: "보고 내역을 찾을 수 없거나 권한이 없습니다.",
                });
                return;
            }
            if (error.message === "CANNOT_UPDATE_COMPLETED_REPORT") {
                res.status(400).json({ message: "처리 완료된 보고는 수정할 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "보고 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteReport = async (req: AuthRequest<{ reportId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const reportId = Number(req.params.reportId);
        if (isNaN(reportId)) {
            res.status(400).json({ message: "유효하지 않은 보고 ID입니다." });
            return;
        }

        await reportService.deleteReport(req.user.id, reportId);
        res.status(200).json({ message: "보고 취소가 완료되었습니다." });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "REPORT_NOT_FOUND") {
                res.status(404).json({
                    message: "보고 내역을 찾을 수 없거나 권한이 없습니다.",
                });
                return;
            }
            if (error.message === "CANNOT_CANCEL_COMPLETED_REPORT") {
                res.status(400).json({ message: "처리 완료된 보고는 취소할 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "보고 취소 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createReportRequest,
    getReportList,
    getReportById,
    updateReport,
    deleteReport,
};
