import { AuthRequest } from "../middlewares/auth.ts";
import { Response } from "express";
import stockService from "../services/stockService.ts";
import {
    UserRequestStockInputType,
    UserUpdateStockInputType,
} from "../schemas/stock/userRequestStockSchema.ts";

const createStockRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다",
            });
            return;
        }

        const input: UserRequestStockInputType = req.body;
        const stock = await stockService.createStock(req.user.id, input);

        res.status(201).json({
            message: "재고 수량 요청이 완료되었습니다. 관리자 승인을 대기해주세요.",
            data: stock,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "재고 수량 요청 중 서버 에러가 발생했습니다.",
        });
    }
};

const getMyStockList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }

        const stock = await stockService.getMyStockList(req.user.id);
        res.status(200).json({
            message: "내 재고 수량 요청 목록을 불러왔습니다.",
            data: stock,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
            res.status(403).json({ message: "소속된 단체 멤버 정보를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({
            message: "내 재고 수량 요청 목록을 불러오는 중 서버 에러가 발생했습니다.",
        });
    }
};

const updateStockRequest = async (req: AuthRequest<{ stockId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const stockId = Number(req.params.stockId);
        if (isNaN(stockId)) {
            res.status(400).json({ message: "유효하지 않은 재고 요청 ID입니다." });
            return;
        }

        const input: UserUpdateStockInputType = req.body;
        const updatedStock = await stockService.updateStockRequest(req.user.id, stockId, input);

        res.status(200).json({
            message: "재고 요청 수정이 완료되었습니다.",
            data: updatedStock,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "STOCK_NOT_FOUND") {
                res.status(404).json({
                    message: "재고 요청 내역을 찾을 수 없거나 권한이 없습니다.",
                });
                return;
            }
            if (error.message === "CANNOT_UPDATE_APPROVED_STOCK") {
                res.status(400).json({ message: "승인 대기 중인 요청만 수정할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "재고 요청 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteStockRequest = async (req: AuthRequest<{ stockId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const stockId = Number(req.params.stockId);
        if (isNaN(stockId)) {
            res.status(400).json({ message: "유효하지 않은 재고 요청 ID입니다." });
            return;
        }

        await stockService.deleteStockRequest(req.user.id, stockId);
        res.status(200).json({ message: "재고 요청 취소가 완료되었습니다." });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "STOCK_NOT_FOUND") {
                res.status(404).json({
                    message: "재고 요청 내역을 찾을 수 없거나 권한이 없습니다.",
                });
                return;
            }
            if (error.message === "CANNOT_CANCEL_APPROVED_STOCK") {
                res.status(400).json({ message: "승인 대기 중인 요청만 취소할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "재고 요청 취소 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createStockRequest,
    getMyStockList,
    updateStockRequest,
    deleteStockRequest,
};
