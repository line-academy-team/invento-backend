import { AuthRequest } from "../../middlewares/auth.ts";
import { Response } from "express";
import ownerDepartmentService from "../../services/owner/ownerDepartmentService.ts";
import {
    AssignDepartmentManagerInputType,
    DepartmentInputType,
} from "../../schemas/manager/department/departmentSchema.ts";

const getDepartmentList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const departments = await ownerDepartmentService.getDepartmentList(req.user.id);

        res.status(200).json({
            message: "조직 부서 리스트를 불러왔습니다.",
            data: departments,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 정보를 조회할 권한이 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "조직 부서 리스트를 불러오는 중 오류가 발생했습니다." });
    }
};

const createDepartment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: DepartmentInputType = req.body;
        const department = await ownerDepartmentService.createDepartment(req.user.id, input);

        res.status(201).json({
            message: "부서가 생성되었습니다.",
            data: department,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message === "FORBIDDEN_OWNER_ONLY") {
            res.status(403).json({ message: "대표자(OWNER)만 부서를 생성할 수 있습니다." });
            return;
        }
        res.status(500).json({ message: "부서 생성 중 오류가 발생했습니다." });
    }
};

const updateDepartment = async (req: AuthRequest<{ departmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(403).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const dpId = Number(req.params.departmentId);
        if (isNaN(dpId)) {
            res.status(400).json({ message: "유효하지 않은 부서 ID입니다." });
            return;
        }

        const input: DepartmentInputType = req.body;
        const updatedDepartment = await ownerDepartmentService.updateDepartment(
            req.user.id,
            dpId,
            input,
        );

        res.status(200).json({
            message: "부서 정보가 수정되었습니다.",
            data: updatedDepartment,
        });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_OWNER_ONLY") {
                res.status(403).json({ message: "대표자(OWNER)만 부서를 수정할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "부서 수정 중 오류가 발생했습니다." });
    }
};

const deleteDepartment = async (req: AuthRequest<{ departmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const dpId = Number(req.params.departmentId);
        if (isNaN(dpId)) {
            res.status(400).json({ message: "유효하지 않은 부서 ID입니다." });
            return;
        }

        await ownerDepartmentService.deleteDepartment(req.user.id, dpId);

        res.status(200).json({ message: "부서 삭제를 완료했습니다." });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_OWNER_ONLY") {
                res.status(403).json({ message: "대표자(OWNER)만 부서를 삭제할 수 있습니다." });
                return;
            }
        }
        res.status(500).json({ message: "부서 삭제 중 오류가 발생했습니다." });
    }
};

const assignDepartmentManager = async (
    req: AuthRequest<{ departmentId: string }>,
    res: Response,
) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: AssignDepartmentManagerInputType = req.body;
        const dpId = Number(req.params.departmentId);
        if (isNaN(dpId)) {
            res.status(400).json({ message: "유효하지 않은 부서 ID입니다." });
            return;
        }

        await ownerDepartmentService.assignDepartmentManager(req.user.id, dpId, input);

        res.status(200).json({ message: "관리자 임명이 완료되었습니다." });
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_OWNER_ONLY") {
                res.status(403).json({ message: "대표자(OWNER)만 관리자를 임명할 수 있습니다." });
                return;
            }
            if (error.message === "MEMBER_NOT_IN_DEPARTMENT") {
                res.status(400).json({
                    message: "해당 부서에 소속된 회원만 관리자로 임명할 수 있습니다.",
                });
            }
        }
        res.status(500).json({ message: "관리자 임명 중 오류가 발생했습니다." });
    }
};

export default {
    getDepartmentList,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignDepartmentManager,
};
