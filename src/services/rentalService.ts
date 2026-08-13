import {
    UserRequestRentalInputType,
    UserUpdateRentalInputType,
} from "../schemas/rental/userRequestRentalSchema.ts";
import { ProcessRentalInputType } from "../schemas/manager/rental/processRentalSchema.ts";
import prisma from "../config/prisma.ts";

export const getMemberByUserId = async (userId: number) => {
    const member = await prisma.member.findFirst({
        where: {
            userId,
            status: "APPROVED",
        },
    });
    if (!member) {
        throw new Error("MEMBER_NOT_FOUND");
    }
    return member;
};

const getManagerMemberByUserId = async (userId: number, organizationId: number) => {
    const member = await prisma.member.findFirst({
        where: {
            userId,
            organizationId,
            status: "APPROVED",
            role: { in: ["OWNER", "MANAGER"] },
        },
    });

    if (!member) throw new Error("MANAGER_PERMISSION_REQUIRED");
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

const getMyRentalById = async (userId: number, rentalId: number) => {
    const member = await getMemberByUserId(userId);

    const rental = await prisma.rental.findFirst({
        where: { id: rentalId, memberId: member.id },
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
    });

    if (!rental) throw new Error("RENTAL_NOT_FOUND");
    return rental;
};

const getOrgRentalList = async (userId: number, ozId: number) => {
    await getManagerMemberByUserId(userId, ozId);

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
                            email: true,
                        },
                    },
                    department: {
                        select: {
                            id: true,
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
                    category: true,
                    imageUrl: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getOrgRentalById = async (userId: number, ozId: number, rentalId: number) => {
    await getManagerMemberByUserId(userId, ozId);

    const rental = await prisma.rental.findFirst({
        where: {
            id: rentalId,
            equipment: { organizationId: ozId },
        },
        include: {
            member: {
                select: {
                    id: true,
                    departmentId: true,
                    role: true,
                    user: { select: { name: true, email: true } },
                    department: { select: { id: true, name: true } },
                },
            },
            equipment: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                    category: true,
                    imageUrl: true,
                },
            },
            equipmentUnit: {
                select: { id: true, assetNumber: true },
            },
        },
    });

    if (!rental) throw new Error("RENTAL_NOT_FOUND");
    return rental;
};

const processRental = async (
    userId: number,
    ozId: number,
    rentalId: number,
    input: ProcessRentalInputType,
) => {
    const manager = await getManagerMemberByUserId(userId, ozId);

    return prisma.$transaction(async tx => {
        const rental = await tx.rental.findFirst({
            where: {
                id: rentalId,
                equipment: { organizationId: ozId },
            },
        });

        if (!rental) throw new Error("RENTAL_NOT_FOUND");
        if (rental.status !== "REQUESTED") throw new Error("RENTAL_ALREADY_PROCESSED");

        if (input.status === "REJECTED") {
            const equipment = await tx.equipment.findUnique({
                where: { id: rental.equipmentId },
            });

            if (equipment) {
                await tx.equipment.update({
                    where: { id: equipment.id },
                    data: { availableQuantity: equipment.availableQuantity + rental.quantity },
                });
            }
        }

        return tx.rental.update({
            where: { id: rentalId },
            data: {
                status: input.status,
                approvedBy: input.status === "BORROWED" ? manager.id : null,
                approvedAt: input.status === "BORROWED" ? new Date() : null,
                rejectedReason:
                    input.status === "REJECTED" ? (input.rejectedReason ?? "").trim() : null,
            },
        });
    });
};

const createRental = async (userId: number, input: UserRequestRentalInputType) => {
    const member = await getMemberByUserId(userId);

    return prisma.$transaction(async tx => {
        const equipment = await tx.equipment.findUnique({
            where: { id: input.equipmentId },
        });

        if (!equipment) throw new Error("EQUIPMENT_NOT_FOUND");
        if (equipment.type !== "CONSUMABLE" && (input.quantity ?? 1) !== 1) {
            throw new Error("INDIVIDUAL_EQUIPMENT_QUANTITY_MUST_BE_ONE");
        }
        if (equipment.availableQuantity < (input.quantity ?? 1)) {
            throw new Error("AVAILABLE_QUANTITY_NOT_ENOUGH");
        }

        await tx.equipment.update({
            where: { id: input.equipmentId },
            data: { availableQuantity: equipment.availableQuantity - (input.quantity ?? 1) },
        });

        return tx.rental.create({
            data: {
                memberId: member.id,
                equipmentId: input.equipmentId,
                ...(input.equipmentUnitId && { equipmentUnitId: input.equipmentUnitId }),
                ...(input.quantity !== undefined && { quantity: input.quantity }),
                ...(input.reason && { reason: input.reason }),
                ...(input.dueAt && { dueAt: input.dueAt }),
                status: "REQUESTED",
            },
        });
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

    if (!rental) throw new Error("RENTAL_NOT_FOUND");

    if (rental.status !== "BORROWED") {
        throw new Error("INVALID_RENTAL_STATUS");
    }

    return prisma.$transaction(async tx => {
        const equipment = await tx.equipment.findUnique({ where: { id: rental.equipmentId } });
        if (equipment) {
            await tx.equipment.update({
                where: { id: rental.equipmentId },
                data: { availableQuantity: equipment.availableQuantity + rental.quantity },
            });
        }

        return tx.rental.update({
            where: { id: rentalId },
            data: { status: "RETURNED", returnedAt: new Date() },
        });
    });
};

const updateRental = async (userId: number, rentalId: number, input: UserUpdateRentalInputType) => {
    const member = await getMemberByUserId(userId);

    const rental = await prisma.rental.findFirst({
        where: {
            id: rentalId,
            memberId: member.id,
        },
    });

    if (!rental) throw new Error("RENTAL_NOT_FOUND");

    if (rental.status !== "REQUESTED") throw new Error("CANNOT_UPDATE_APPROVED_RENTAL");

    const equipment = await prisma.equipment.findUnique({
        where: { id: rental.equipmentId },
        select: { type: true },
    });
    if (equipment?.type !== "CONSUMABLE" && input.quantity !== undefined && input.quantity !== 1) {
        throw new Error("INDIVIDUAL_EQUIPMENT_QUANTITY_MUST_BE_ONE");
    }

    return prisma.rental.update({
        where: { id: rentalId },
        data: {
            ...(input.quantity !== undefined && { quantity: input.quantity }),
            ...(input.reason && { reason: input.reason }),
            ...(input.dueAt && { dueAt: new Date(input.dueAt) }),
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

    return prisma.$transaction(async tx => {
        const equipment = await tx.equipment.findUnique({ where: { id: rental.equipmentId } });
        if (equipment) {
            await tx.equipment.update({
                where: { id: rental.equipmentId },
                data: { availableQuantity: equipment.availableQuantity + rental.quantity },
            });
        }

        return tx.rental.delete({
            where: { id: rentalId },
        });
    });
};

export default {
    getMyRentalList,
    getMyRentalById,
    getOrgRentalList,
    getOrgRentalById,
    processRental,
    createRental,
    returnRental,
    updateRental,
    deleteRental,
};
