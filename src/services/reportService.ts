import {
    UserCreateReportInputType,
    UserUpdateReportInputType,
} from "../schemas/report/userReportSchema.ts";
import { ProcessReportInputType } from "../schemas/manager/report/processReportSchema.ts";
import prisma from "../config/prisma.ts";
import { getMemberByUserId } from "./rentalService.ts";

const createReport = async (userId: number, input: UserCreateReportInputType) => {
    const member = await getMemberByUserId(userId);

    if (input.type === "BROKEN" && input.equipmentId !== undefined) {
        const borrowedRental = await prisma.rental.findFirst({
            where: {
                memberId: member.id,
                equipmentId: input.equipmentId,
                status: "BORROWED",
            },
        });
        if (!borrowedRental) throw new Error("BORROWED_RENTAL_REQUIRED");

        const pendingReport = await prisma.report.findFirst({
            where: {
                reporterId: member.id,
                equipmentId: input.equipmentId,
                type: "BROKEN",
                status: "PENDING",
            },
        });
        if (pendingReport) throw new Error("PENDING_REPORT_ALREADY_EXISTS");
    }

    return prisma.report.create({
        data: {
            reporterId: member.id,
            type: input.type,
            title: input.title,
            content: input.content,
            ...(input.equipmentId !== undefined && { equipmentId: input.equipmentId }),
        },
    });
};

const getReportList = async (userId: number, ozId?: number) => {
    let whereCondition = {};

    if (ozId) {
        const isManager = await prisma.member.findFirst({
            where: {
                userId,
                organizationId: ozId,
                status: "APPROVED",
                role: { in: ["OWNER", "MANAGER"] },
            },
        });

        if (!isManager) {
            throw new Error("MANAGER_PERMISSION_REQUIRED");
        }

        whereCondition = {
            reporter: {
                organizationId: ozId,
            },
        };
    } else {
        const member = await getMemberByUserId(userId);
        whereCondition = {
            reporterId: member.id,
        };
    }

    return prisma.report.findMany({
        where: whereCondition,
        select: {
            id: true,
            equipmentId: true,
            reporterId: true,
            type: true,
            title: true,
            content: true,
            status: true,
            processedAt: true,
            result: true,
            createdAt: true,
            reporter: {
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
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

const getReportById = async (userId: number, reportId: number) => {
    const member = await getMemberByUserId(userId);

    const report = await prisma.report.findFirst({
        where: {
            id: reportId,
            reporter: {
                organizationId: member.organizationId,
            },
            ...(member.role === "MEMBER" && { reporterId: member.id }),
        },
        include: {
            reporter: {
                select: {
                    id: true,
                    role: true,
                    user: { select: { name: true, email: true } },
                    department: { select: { id: true, name: true } },
                },
            },
            equipment: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    category: true,
                },
            },
        },
    });

    if (!report) throw new Error("REPORT_NOT_FOUND");
    return report;
};

const processReport = async (userId: number, reportId: number, input: ProcessReportInputType) => {
    const manager = await prisma.member.findFirst({
        where: {
            userId,
            status: "APPROVED",
            role: { in: ["OWNER", "MANAGER"] },
        },
    });

    if (!manager) throw new Error("MANAGER_PERMISSION_REQUIRED");

    const report = await prisma.report.findFirst({
        where: {
            id: reportId,
            reporter: { organizationId: manager.organizationId },
        },
    });

    if (!report) throw new Error("REPORT_NOT_FOUND");
    if (report.status === "COMPLETED") throw new Error("REPORT_ALREADY_PROCESSED");

    return prisma.report.update({
        where: { id: reportId },
        data: {
            type: input.type,
            result: input.result,
            status: "COMPLETED",
            processedBy: manager.id,
            processedAt: new Date(),
        },
    });
};

const updateReport = async (userId: number, reportId: number, input: UserUpdateReportInputType) => {
    const member = await getMemberByUserId(userId);

    const report = await prisma.report.findFirst({
        where: {
            id: reportId,
            reporterId: member.id,
        },
    });

    if (!report) {
        throw new Error("REPORT_NOT_FOUND");
    }

    if (report.status === "COMPLETED") {
        throw new Error("CANNOT_UPDATE_COMPLETED_REPORT");
    }

    return prisma.report.update({
        where: { id: reportId },
        data: {
            ...(input.type !== undefined && { type: input.type }),
            ...(input.title !== undefined && { title: input.title }),
            ...(input.content !== undefined && { content: input.content }),
        },
    });
};

const deleteReport = async (userId: number, reportId: number) => {
    const member = await getMemberByUserId(userId);

    const report = await prisma.report.findFirst({
        where: {
            id: reportId,
            reporterId: member.id,
        },
    });

    if (!report) throw new Error("REPORT_NOT_FOUND");

    if (report.status === "COMPLETED") {
        throw new Error("CANNOT_CANCEL_COMPLETED_REPORT");
    }

    return prisma.report.delete({
        where: { id: reportId },
    });
};

export default {
    createReport,
    getReportList,
    getReportById,
    processReport,
    updateReport,
    deleteReport,
};
