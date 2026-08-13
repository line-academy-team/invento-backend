import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import equipmentService from "../services/equipmentService.ts";
import { UpdateEquipmentInputType } from "../schemas/manager/equipment/equipmentSchema.ts";

const getEquipmentList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const { category, search } = req.query;
        const equipments = await equipmentService.getEquipmentList(
            req.user.id,
            category as string | undefined,
            search as string | undefined,
        );
        res.status(200).json({ message: "장비 목록을 조회했습니다.", data: equipments });
    } catch (error) {
        res.status(500).json({ message: "장비 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const getEquipmentById = async (req: AuthRequest<{ equipmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const equipmentId = Number(req.params.equipmentId);
        if (isNaN(equipmentId)) {
            res.status(400).json({ message: "유효하지 않은 장비 ID입니다." });
            return;
        }
        const equipment = await equipmentService.getEquipmentById(req.user.id, equipmentId);
        res.status(200).json({ message: "장비 상세 정보를 조회했습니다.", data: equipment });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EQUIPMENT_NOT_FOUND") {
                res.status(404).json({ message: "장비를 찾을 수 없습니다." });
                return;
            }
            if (error.message === "EQUIPMENT_NOT_IN_ORGANIZARION_OR_DEPARTMENT") {
                res.status(403).json({ message: "조직이나 부서 내에 있는 장비가 아닙니다." });
            }
        }
        res.status(500).json({ message: "장비 상세 조회 중 서버 에러가 발생했습니다." });
    }
};

const createEquipment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }
        const newEquipment = await equipmentService.createEquipment(req.user.id, req.body);
        res.status(201).json({ message: "장비가 등록되었습니다.", data: newEquipment });
    } catch (error) {
        if (error instanceof Error && error.message === "CANNOT_CREATE_EQUIPMENT_MEMBER") {
            res.status(403).json({ message: "일반 사용자는 장비 등록 권한이 없습니다." });
        }
        res.status(500).json({ message: "장비 등록 중 서버 에러가 발생했습니다." });
    }
};

const updateEquipment = async (req: AuthRequest<{ equipmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const equipmentId = Number(req.params.equipmentId);
        if (isNaN(equipmentId)) {
            res.status(400).json({ message: "유효하지 않은 장비 ID입니다." });
            return;
        }

        const input: UpdateEquipmentInputType = req.body;
        const updatedEquipment = await equipmentService.updateEquipment(
            req.user.id,
            equipmentId,
            input,
        );

        res.status(200).json({
            message: "장비 정보 수정이 완료되었습니다.",
            data: updatedEquipment,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EQUIPMENT_NOT_FOUND") {
                res.status(404).json({ message: "장비 내역을 찾을 수 없거나 권한이 없습니다." });
                return;
            }
            if (error.message === "CANNOT_UPDATE_EQUIPMENT_MEMBER") {
                res.status(403).json({ message: "일반 사용자는 장비 정보 수정 권한이 없습니다." });
            }
        }
        res.status(500).json({ message: "장비 정보 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteEquipment = async (req: AuthRequest<{ equipmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const equipmentId = Number(req.params.equipmentId);
        if (isNaN(equipmentId)) {
            res.status(400).json({ message: "유효하지 않은 장비 ID입니다." });
            return;
        }

        await equipmentService.deleteEquipment(req.user.id, equipmentId);
        res.status(200).json({ message: "장비 삭제가 완료되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EQUIPMENT_NOT_FOUND") {
                res.status(404).json({ message: "장비 내역을 찾을 수 없거나 권한이 없습니다," });
            }
            if (error.message === "CANNOT_DELETE_EQUIPMENT_MEMBER") {
                res.status(403).json({ message: "일반 사용자는 장비 삭제 권한이 없습니다." });
            }
        }
        res.status(500).json({ message: "장비 삭제 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getEquipmentList,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};
