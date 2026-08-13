import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import equipmentUnitService from "../services/equipmentUnitService.ts";

const getUnitByEquipmentId = async (req: AuthRequest<{ equipmentId: string }>, res: Response) => {
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
        const units = await equipmentUnitService.getUnitsByEquipmentId(req.user.id, equipmentId);
        res.status(200).json({ message: "장비 유닛 목록을 조회했습니다.", data: units });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "UNIT_NOT_FOUND") {
                res.status(404).json({ message: "장비 유닛을 찾을 수 없습니다." });
            }
            if (error.message === "EQUIPMENTUNIT_NOT_IN_ORGANIZATION_OR_DEPARTMENT") {
                res.status(403).json({ message: "조직이나 부서 내에 있는 장비 유닛이 아닙니다." });
            }
        }
        res.status(500).json({ message: "장비 유닛 조회 중 서버 에러가 발생했습니다." });
    }
};

const createUnit = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }
        const newUnit = await equipmentUnitService.createEquipmentUnit(req.user.id, req.body);
        res.status(201).json({ message: "장비 유닛이 등록되었습니다.", data: newUnit });
    } catch (error) {
        if (error instanceof Error && error.message === "CANNOT_CREATE_EQUIPMENTUNIT_MEMBER") {
            res.status(403).json({ message: "일반 사용자는 장비 유닛 등록 권한이 없습니다." });
        }
        res.status(500).json({ message: "장비 유닛 등록 중 서버 에러가 발생했습니다." });
    }
};

const updateUnit = async (req: AuthRequest<{ unitId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }
        const unitId = Number(req.params.unitId);
        if (isNaN(unitId)) {
            res.status(400).json({ message: "유효하지 않은 장비 유닛 ID입니다." });
            return;
        }
        const updatedUnit = await equipmentUnitService.updateEquipmentUnit(
            req.user.id,
            unitId,
            req.body,
        );
        res.status(200).json({ message: "장비 유닛 정보가 수정되었습니다.", data: updatedUnit });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "UNIT_NOT_FOUND") {
                res.status(404).json({ message: "장비 유닛을 찾을 수 없습니다." });
                return;
            }
            if (error.message === "CANNOT_UPDATE_EQUIPMENTUNIT_MEMBER") {
                res.status(403).json({ message: "일반 사용자는 장비 유닛 수정 권한이 없습니다." });
            }
        }
        res.status(500).json({ message: "장비 유닛 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteUnit = async (req: AuthRequest<{ unitId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }
        const unitId = Number(req.params.unitId);
        if (isNaN(unitId)) {
            res.status(400).json({ message: "유효하지 않은 장비 유닛 ID입니다." });
            return;
        }
        await equipmentUnitService.deleteEquipmentUnit(req.user.id, unitId);
        res.status(200).json({ message: "장비 유닛이 삭제되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "UNIT_NOT_FOUND") {
                res.status(404).json({ message: "장비 유닛을 찾을 수 없습니다." });
                return;
            }
            if (error.message === "CANNOT_DELETE_EQUIPMENTUNIT_MEMBER") {
                res.status(403).json({ message: "일반 사용자는 장비 유닛 삭제 권한이 없습니다." });
            }
        }
        res.status(500).json({ message: "장비 유닛 삭제 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getUnitByEquipmentId,
    createUnit,
    updateUnit,
    deleteUnit,
};
