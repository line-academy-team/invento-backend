import { UserRequestRentalInputType } from "../schemas/rental/userRequestRentalSchema.ts";
import prisma from "../config/prisma.ts";

export const getMemberByUserId = async (userId: number) => {
    const member = await prisma.member.findFirst({
        where: {
            userId,
            status: { in: ["APPROVED"] },
        },
    });
    if (!member) {
        throw new Error("MEMBER_NOT_FOUND");
    }
    return member;
};

const getMyRentalList = async (userId: number) => {
    const member = await getMemberByUserId(userId);

    return prisma.rental.findMany({
        where: {
            memberId: member.id,
        },
        include: {
            equipment: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    category: true,
                },
            },
            equipmentUnit: {
                select: {
                    id: true,
                    assetNumber: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getOrgRentalList = async (ozId: number) => {
    return prisma.rental.findMany({
        where: {
            equipment: {
                organizationId: ozId,
            },
        },
        include: {
            member: {
                select: {
                    id: true,
                    departmentId: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            equipment: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const createRental = async (userId: number, input: UserRequestRentalInputType) => {
    const member = await getMemberByUserId(userId);

    return prisma.rental.create({
        data: {
            memberId: member.id,
            equipmentId: input.equipmentId,
            ...(input.equipmentUnitId && { equipmentUnitId: input.equipmentUnitId }),
            ...(input.quantity !== undefined && { quantity: input.quantity }),
            ...(input.reason && { reason: input.reason }),
            ...(input.dueAt && { dueAt: input.dueAt }),
        },
    });
};

const returnRental = async (userId: number, rentalId: number) => {
    const member = await getMemberByUserId(userId);

    const rental = await prisma.rental.findFirst({
        where: {
            id: rentalId,
            memberId: member.id,
        },
    });

    if (!rental) {
        throw new Error("RENTAL_NOT_FOUND");
    }

    if (rental.status !== "BORROWED") {
        throw new Error("INVALID_RENTAL_STATUS");
    }

    return prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: "RETURNED",
            returnedAt: new Date(),
        },
    });
};

const updateRental = async (
    userId: number,
    rentalId: number,
    input: UserRequestRentalInputType,
) => {
    const member = await getMemberByUserId(userId);

    const rental = await prisma.rental.findFirst({
        where: {
            id: rentalId,
            memberId: member.id,
        },
    });

    if (!rental) throw new Error("RENTAL_NOT_FOUND");

    if (rental.status !== "REQUESTED") throw new Error("CANNOT_UPDATE_APPROVED_RENTAL");

    return prisma.rental.update({
        where: { id: rentalId },
        data: {
            equipmentId: input.equipmentId,
            ...(input.equipmentUnitId && { equipmentUnitId: input.equipmentUnitId }),
            ...(input.quantity !== undefined && { quantity: input.quantity }),
            ...(input.reason && { reason: input.reason }),
            ...(input.dueAt && { dueAt: input.dueAt }),
        },
    });
};

const deleteRental = async (userId: number, rentalId: number) => {
    const member = await getMemberByUserId(userId);

    const rental = await prisma.rental.findFirst({
        where: {
            id: rentalId,
            memberId: member.id,
        },
    });

    if (!rental) throw new Error("RENTAL_NOT_FOUND");

    if (rental.status !== "REQUESTED") {
        throw new Error("CANNOT_CANCEL_APPROVED_RENTAL");
    }

    return prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: "CANCELLED",
        },
    });
};

export default {
    getMyRentalList,
    getOrgRentalList,
    createRental,
    returnRental,
    updateRental,
    deleteRental,
};
