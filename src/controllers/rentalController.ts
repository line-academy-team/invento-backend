import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import { UserRequestRentalInputType } from "../schemas/rental/userRequestRentalSchema.ts";
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

const getOrgRentalList = async (req: AuthRequest<{ orgId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }

        const ozId = Number(req.params.orgId);
        if (isNaN(ozId)) {
            res.status(400).json({ message: "유효하지 않은 조직 ID입니다." });
        }

        const rental = await rentalService.getOrgRentalList(ozId);

        res.status(200).json({
            message: "조직 대여 신청 목록을 불러왔습니다.",
            data: rental,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "조직 대여 신청 목록을 불러오는 중 서버 에러가 발생했습니다.",
        });
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

const updateRental = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.body.rentalId);
        if (isNaN(rentalId)) {
            res.status(400).json({ message: "유효하지 않은 대여 ID입니다." });
            return;
        }

        const input: UserRequestRentalInputType = req.body;
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

const deleteRental = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const rentalId = Number(req.params.id);
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
            if (error.message === "CANNOT_CANCLE_APPROVED_RENTAL") {
                res.status(400).json({ message: "승인 대기 중인 대여 신청만 취소할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "대기 신청 취소 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getMyRentalList,
    getOrgRentalList,
    createRentalRequest,
    returnRental,
    updateRental,
    deleteRental,
};
