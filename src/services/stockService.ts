import { UserRequestStockInputType } from "../schemas/stock/userRequestStockSchema.ts";
import { getMemberByUserId } from "./rentalService.ts";
import prisma from "../config/prisma.ts";

const createStock = async (userId: number, input: UserRequestStockInputType) => {
    const member = await getMemberByUserId(userId);

    return prisma.equipmentStockRequest.create({
        data: {
            requesterId: member.id,
            equipmentId: input.equipmentId,
            quantity: input.quantity,
            reason: input.reason ?? null,
        },
    });
};

const getMyStockList = async (userId: number) => {
    const member = await getMemberByUserId(userId);

    return prisma.equipmentStockRequest.findMany({
        where: {
            requesterId: member.id,
        },
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
    input: UserRequestStockInputType,
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

    return prisma.equipmentStockRequest.update({
        where: { id: stockId },
        data: {
            equipmentId: input.equipmentId,
            quantity: input.quantity,
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
        throw new Error("CANNOT_CANCLE_APPROVED_STOCK");
    }

    return prisma.equipmentStockRequest.delete({
        where: { id: stockId },
    });
};

export default {
    createStock,
    getMyStockList,
    updateStockRequest,
    deleteStockRequest,
};
