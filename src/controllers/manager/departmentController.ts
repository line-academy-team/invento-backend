import { AuthRequest } from "../../middlewares/auth.ts";
import { Response } from "express";
import departmentService from "../../services/manager/departmentService.ts";
import { TransferDepartmentInput } from "../../schemas/manager/department/departmentSchema.ts";

const getOrgMemberList = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const search = typeof req.query.search === "string" ? req.query.search : undefined;

        const members = await departmentService.getOrgMemberList(req.user.id, search);

        res.status(200).json({
            message: "조직 멤버 리스트를 불러왔습니다.",
            data: members,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 정보를 조회할 권한이 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "조직 멤버 리스트를 불러오는 중 오류가 발생했습니다." });
    }
};

const getDepartmentById = async (req: AuthRequest<{ departmentId: string }>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const dpId = Number(req.params.departmentId);

        if (!dpId || isNaN(dpId)) {
            res.status(400).json({ message: "유효하지 않은 부서 ID입니다." });
            return;
        }

        const department = await departmentService.getDepartmentById(req.user.id, dpId);

        res.status(200).json({
            message: "부서 상세 정보를 불러왔습니다.",
            data: department,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "해당 정보를 조회할 권한이 없습니다." });
                return;
            }
            if (error.message === "DEPARTMENT_NOT_FOUND") {
                res.status(404).json({ message: "해당 부서를 찾을 수 없습니다." });
                return;
            }
            if (error.message === "FORBIDDEN_DEPARTMENT_VIEW") {
                res.status(403).json({ message: "해당 부서를 조회할 권한이 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "부서 정보를 불러오는 중 오류가 발생했습니다." });
    }
};

const transferDepartment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
            return;
        }

        const input: TransferDepartmentInput = req.body;

        await departmentService.transferDepartment(req.user.id, input);

        res.status(200).json({ message: "성공적으로 부서 이동이 완료되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "FORBIDDEN_APPROVAL") {
                res.status(403).json({ message: "부서 이동을 처리할 권한이 없습니다." });
                return;
            }
            if (error.message === "DEPARTMENT_NOT_FOUND") {
                res.status(404).json({ message: "이동하려는 부서를 찾을 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "부서 이동 처리 중 오류가 발생했습니다." });
    }
};

export default {
    getOrgMemberList,
    getDepartmentById,
    transferDepartment,
};
