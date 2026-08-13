import prisma from "../config/prisma.ts";
import {
    CreateEquipmentUnitInputType,
    UpdateEquipmentUnitInputType,
} from "../schemas/manager/equipment/equipmentUnitSchema.ts";
import { getMemberByUserId } from "./rentalService.ts";

const getUnitsByEquipmentId = async (userId: number, equipmentId: number) => {
    const member = await getMemberByUserId(userId);

    let targetDepartmentId =
        member.role === "OWNER" ? undefined : (member.departmentId ?? undefined);

    const unit = await prisma.equipmentUnit.findMany({
        where: {
            equipmentId,
        },
        orderBy: { createdAt: "desc" },
    });

    const equipment = await prisma.equipment.findUnique({
        where: {
            id: equipmentId,
        },
    });

    if (!equipment) {
        throw new Error("UNIT_NOT_FOUND");
    }

    if (
        targetDepartmentId !== undefined &&
        equipment.departmentId !== targetDepartmentId &&
        equipment.organizationId !== member.organizationId
    ) {
        throw new Error("EQUIPMENTUNIT_NOT_IN_ORGANIZATION_OR_DEPARTMENT");
    }

    return unit;
};

const createEquipmentUnit = async (userId: number, input: CreateEquipmentUnitInputType) => {
    const member = await getMemberByUserId(userId);

    if (member.role === "MEMBER") throw new Error("CANNOT_CREATE_EQUIPMENTUNIT_MEMBER");

    return prisma.equipmentUnit.create({
        data: {
            equipmentId: input.equipmentId,
            assetNumber: input.assetNumber,
            status: input.status ?? "AVAILABLE",
        },
    });
};

const updateEquipmentUnit = async (
    userId: number,
    unitId: number,
    input: UpdateEquipmentUnitInputType,
) => {
    const member = await getMemberByUserId(userId);

    if (member.role === "MEMBER") throw new Error("CANNOT_UPDATE_EQUIPMENTUNIT_MEMBER");

    const unit = await prisma.equipmentUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new Error("UNIT_NOT_FOUND");

    return prisma.equipmentUnit.update({
        where: { id: unitId },
        data: {
            ...(input.assetNumber && { assetNumber: input.assetNumber }),
            ...(input.status !== undefined && { status: input.status }),
        },
    });
};

const deleteEquipmentUnit = async (userId: number, unitId: number) => {
    const member = await getMemberByUserId(userId);
    if (member.role === "MEMBER") throw new Error("CANNOT_DELETE_EQUIPMENTUNIT_MEMBER");

    const unit = await prisma.equipmentUnit.findUnique({ where: { id: unitId } });
    if (!unit) throw new Error("UNIT_NOT_FOUND");

    return prisma.equipmentUnit.delete({
        where: { id: unitId },
    });
};

export default {
    getUnitsByEquipmentId,
    createEquipmentUnit,
    updateEquipmentUnit,
    deleteEquipmentUnit,
};
