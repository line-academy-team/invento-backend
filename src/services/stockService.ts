import {
    UserRequestStockInputType,
    UserUpdateStockInputType,
} from "../schemas/stock/userRequestStockSchema.ts";
import { getMemberByUserId } from "./rentalService.ts";
import prisma from "../config/prisma.ts";

const createStock = async (userId: number, input: UserRequestStockInputType) => {
    const member = await getMemberByUserId(userId);
    const equipment = await prisma.equipment.findUnique({
        where: { id: input.equipmentId },
        select: { type: true, organizationId: true },
    });

    if (!equipment || equipment.organizationId !== member.organizationId) {
        throw new Error("EQUIPMENT_NOT_FOUND");
    }
    if (equipment.type !== "CONSUMABLE" && input.quantity !== 1) {
        throw new Error("INDIVIDUAL_EQUIPMENT_QUANTITY_MUST_BE_ONE");
    }

    return prisma.equipmentStockRequest.create({
        data: {
            requesterId: member.id,
            equipmentId: input.equipmentId,
            quantity: input.quantity,
            reason: input.reason ?? null,
        },
    });
};

const getStockList = async (userId: number, ozId?: number) => {
    let where = {};

    if (ozId) {
        const isMember = await prisma.member.findFirst({
            where: {
                userId,
                organizationId: ozId,
                status: "APPROVED",
            },
        });

        if (!isMember) {
            throw new Error("NOT_A_MEMBER_OF_ORGANIZATION");
        }

        where = {
            requester: {
                organizationId: ozId,
            },
        };
    } else {
        const member = await getMemberByUserId(userId);
        where = {
            requesterId: member.id,
        };
    }

    return prisma.equipmentStockRequest.findMany({
        where: where,
        select: {
            id: true,
            quantity: true,
            reason: true,
            status: true,
            createdAt: true,
            equipment: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    category: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateStockRequest = async (
    userId: number,
    stockId: number,
    input: UserUpdateStockInputType,
) => {
    const member = await getMemberByUserId(userId);

    const stock = await prisma.equipmentStockRequest.findFirst({
        where: {
            id: stockId,
            requesterId: member.id,
        },
    });

    if (!stock) throw new Error("STOCK_NOT_FOUND");

    if (stock.status !== "PENDING") {
        throw new Error("CANNOT_UPDATE_APPROVED_STOCK");
    }

    const equipment = await prisma.equipment.findUnique({
        where: { id: stock.equipmentId },
        select: { type: true },
    });
    if (equipment?.type !== "CONSUMABLE" && input.quantity !== undefined && input.quantity !== 1) {
        throw new Error("INDIVIDUAL_EQUIPMENT_QUANTITY_MUST_BE_ONE");
    }

    return prisma.equipmentStockRequest.update({
        where: { id: stockId },
        data: {
            ...(input.quantity !== undefined && { quantity: input.quantity }),
            ...(input.reason && { reason: input.reason }),
        },
    });
};

const deleteStockRequest = async (userId: number, stockId: number) => {
    const member = await getMemberByUserId(userId);

    const stock = await prisma.equipmentStockRequest.findFirst({
        where: {
            id: stockId,
            requesterId: member.id,
        },
    });

    if (!stock) throw new Error("STOCK_NOT_FOUND");

    if (stock.status !== "PENDING") {
        throw new Error("CANNOT_CANCEL_APPROVED_STOCK");
    }

    return prisma.equipmentStockRequest.delete({
        where: { id: stockId },
    });
};

export default {
    createStock,
    getStockList,
    updateStockRequest,
    deleteStockRequest,
};
