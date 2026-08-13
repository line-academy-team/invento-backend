import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import {
    UserRequestRentalInputType,
    UserUpdateRentalInputType,
} from "../schemas/rental/userRequestRentalSchema.ts";
import { ProcessRentalInputType } from "../schemas/manager/rental/processRentalSchema.ts";
import rentalService from "../services/rentalService.ts";

const getMyRentalList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }

        const rental = await rentalService.getMyRentalList(req.user.id);
        res.status(200).json({
            message: "내 대여 신청 목록을 불러왔습니다.",
            data: rental,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
            res.status(403).json({ message: "소속된 단체 멤버 정보를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({
            message: "내 대여 신청 목록을 불러오는 중 서버 에러가 발생했습니다.",
        });
    }
};

const getMyRentalById = async (req: AuthRequest<{ rentalId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.params.rentalId);
        if (isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 대여 ID입니다." });
            return;
        }

        const rental = await rentalService.getMyRentalById(req.user.id, rentalId);
        res.status(200).json({ message: "대여 상세 내역을 불러왔습니다.", data: rental });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "RENTAL_NOT_FOUND") {
            res.status(404).json({ message: "대여 내역을 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "대여 상세 조회 중 서버 에러가 발생했습니다." });
    }
};

const getOrgRentalList = async (req: AuthRequest<{ ozId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }

        const ozId = Number(req.params.ozId);
        if (isNaN(ozId)) {
            res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
            return;
        }

        const rental = await rentalService.getOrgRentalList(req.user.id, ozId);

        res.status(200).json({
            message: "조직 대여 신청 목록을 불러왔습니다.",
            data: rental,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "MANAGER_PERMISSION_REQUIRED") {
            res.status(403).json({ message: "대여 관리 권한이 없습니다." });
            return;
        }
        res.status(500).json({
            message: "조직 대여 신청 목록을 불러오는 중 서버 에러가 발생했습니다.",
        });
    }
};

const getOrgRentalById = async (
    req: AuthRequest<{ ozId: string; rentalId: string }>,
    res: Response,
) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const ozId = Number(req.params.ozId);
        const rentalId = Number(req.params.rentalId);
        if (isNaN(ozId) || isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 조직 또는 대여 ID입니다." });
            return;
        }

        const rental = await rentalService.getOrgRentalById(req.user.id, ozId, rentalId);
        res.status(200).json({ message: "대여 요청 상세를 불러왔습니다.", data: rental });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "MANAGER_PERMISSION_REQUIRED") {
                res.status(403).json({ message: "대여 관리 권한이 없습니다." });
                return;
            }
            if (error.message === "RENTAL_NOT_FOUND") {
                res.status(404).json({ message: "대여 요청을 찾을 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "대여 요청 상세 조회 중 서버 에러가 발생했습니다." });
    }
};

const processRental = async (
    req: AuthRequest<{ ozId: string; rentalId: string }>,
    res: Response,
) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const ozId = Number(req.params.ozId);
        const rentalId = Number(req.params.rentalId);
        if (isNaN(ozId) || isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 조직 또는 대여 ID입니다." });
            return;
        }

        const input: ProcessRentalInputType = req.body;
        const rental = await rentalService.processRental(req.user.id, ozId, rentalId, input);
        res.status(200).json({
            message:
                input.status === "BORROWED"
                    ? "대여 요청을 승인했습니다."
                    : "대여 요청을 반려했습니다.",
            data: rental,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "MANAGER_PERMISSION_REQUIRED") {
                res.status(403).json({ message: "대여 관리 권한이 없습니다." });
                return;
            }
            if (error.message === "RENTAL_NOT_FOUND") {
                res.status(404).json({ message: "대여 요청을 찾을 수 없습니다." });
                return;
            }
            if (error.message === "RENTAL_ALREADY_PROCESSED") {
                res.status(400).json({ message: "이미 처리된 대여 요청입니다." });
                return;
            }
        }
        res.status(500).json({ message: "대여 요청 처리 중 서버 에러가 발생했습니다." });
    }
};

const createRentalRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: UserRequestRentalInputType = req.body;
        const newRental = await rentalService.createRental(req.user.id, input);

        res.status(201).json({
            message: "대여 신청이 완료되었습니다. 관리자 승인을 대기해주세요.",
            data: newRental,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "대여 신청 중 서버 에러가 발생하였습니다." });
    }
};

const returnRental = async (req: AuthRequest<{ rentalId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.params.rentalId);
        if (isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 대여 ID입니다." });
            return;
        }

        await rentalService.returnRental(req.user.id, rentalId);

        res.status(200).json({ message: "반납이 완료되었습니다." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "비품 반남 중 서버 에러가 발생하였습니다." });
    }
};

const updateRental = async (req: AuthRequest<{ rentalId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.params.rentalId);
        if (isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 대여 ID입니다." });
            return;
        }

        const input: UserUpdateRentalInputType = req.body;
        const updatedRental = await rentalService.updateRental(req.user.id, rentalId, input);

        res.status(200).json({
            message: "대여 신청이 수정되었습니다.",
            data: updatedRental,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "RENTAL_NOT_FOUND") {
                res.status(404).json({ message: "대여 내역을 찾을 수 없거나 권한이 없습니다." });
                return;
            }
            if (error.message === "CANNOT_UPDATE_APPROVED_RENTAL") {
                res.status(400).json({ message: "승인 대기 중인 대여 신청만 수정할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "대여 신청 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteRental = async (req: AuthRequest<{ rentalId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.params.rentalId);
        if (isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 대여 ID입니다." });
            return;
        }

        await rentalService.deleteRental(req.user.id, rentalId);
        res.status(200).json({ message: "대여 신청 취소가 완료되었습니다." });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "RENTAL_NOT_FOUND") {
                res.status(404).json({ message: "대여 내역을 찾을 수 없거나 권한이 없습니다." });
                return;
            }
            if (error.message === "CANNOT_CANCEL_APPROVED_RENTAL") {
                res.status(400).json({ message: "승인 대기 중인 대여 신청만 취소할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "대기 신청 취소 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getMyRentalList,
    getMyRentalById,
    getOrgRentalList,
    getOrgRentalById,
    processRental,
    createRentalRequest,
    returnRental,
    updateRental,
    deleteRental,
};
