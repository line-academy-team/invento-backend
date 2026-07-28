import prisma from "../config/prisma.ts";
import {
    CreateEquipmentInputType,
    UpdateEquipmentInputType,
} from "../schemas/manager/equipment/equipmentSchema.ts";
import { getMemberByUserId } from "./rentalService.ts";

const getEquipments = async (userId: number, category?: string, search?: string) => {
    const member = await getMemberByUserId(userId);

    return prisma.equipment.findMany({
        where: {
            organizationId: member.organizationId,
            ...(category && category !== "전체" && { category }),
            ...(search && { name: { contains: search, mode: "insensitive" } }),
        },
        include: {
            department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getEquipmentById = async (equipmentId: number) => {
    const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        include: {
            department: { select: { id: true, name: true } },
            units: true,
        },
    });

    if (!equipment) throw new Error("EQUIPMENT_NOT_FOUND");
    return equipment;
};

const createEquipment = async (userId: number, input: CreateEquipmentInputType) => {
    const member = await getMemberByUserId(userId);

    if (member.role === "MEMBER") throw new Error("CANNOT_CREATE_EQUIPMENT_MEMBER");

    return prisma.equipment.create({
        data: {
            name: input.name,
            type: input.type,
            totalQuantity: input.totalQuantity,
            availableQuantity: input.totalQuantity,
            organizationId: member.organizationId,
            createdBy: member.id,
            departmentId: input.departmentId ?? null,
            category: input.category ?? null,
            description: input.description ?? null,
            imageUrl: input.imageUrl ?? null,
        },
    });
};

const updateEquipment = async (
    userId: number,
    equipmentId: number,
    input: UpdateEquipmentInputType,
) => {
    const member = await getMemberByUserId(userId);

    if (member.role === "MEMBER") throw new Error("CANNOT_UPDATE_EQUIPMENT_MEMBER");

    const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
    });
    if (!equipment) throw new Error("EQUIPMENT_NOT_FOUND");

    return prisma.equipment.update({
        where: { id: equipmentId },
        data: {
            ...(input.name && { name: input.name }),
            ...(input.type && { type: input.type }),
            ...(input.totalQuantity !== undefined && { totalQuantity: input.totalQuantity }),
            ...(input.departmentId !== undefined && { departmentId: input.departmentId ?? null }),
            ...(input.category !== undefined && { category: input.category ?? null }),
            ...(input.description !== undefined && { description: input.description ?? null }),
            ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl ?? null }),
        },
    });
};

const deleteEquipment = async (userId: number, equipmentId: number) => {
    const member = await getMemberByUserId(userId);
    if (member.role === "MEMBER") throw new Error("CANNOT_DELETE_EQUIPMENT_MEMBER");

    const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
    });
    if (!equipment) throw new Error("EQUIPMENT_NOT_FOUND");

    return prisma.equipment.delete({
        where: { id: equipmentId },
    });
};

export default {
    getEquipments,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};
