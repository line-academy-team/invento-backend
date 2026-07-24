import {
    UserCreateReportInputType,
    UserUpdateReportInputType,
} from "../schemas/report/userReportSchema.ts";
import prisma from "../config/prisma.ts";
import { getMemberByUserId } from "./rentalService.ts";

const createReport = async (userId: number, input: UserCreateReportInputType) => {
    const member = await getMemberByUserId(userId);

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
            type: true,
            title: true,
            content: true,
            status: true,
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

    const isMember = await prisma.member.findFirst({
        where: {
            userId,
            organizationId: member.organizationId,
            status: "APPROVED",
        },
    });

    if (!isMember) {
        throw new Error("NOT_A_MEMBER_OF_ORGANIZATION");
    }

    return prisma.report.findUnique({
        where: {
            id: reportId,
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
    updateReport,
    deleteReport,
};
