import prisma from "../../config/prisma.ts";

const getDashboardData = async (userId: number) => {
    const member = await prisma.member.findFirst({
        where: {
            userId,
            status: "APPROVED",
            role: { in: ["OWNER", "MANAGER"] },
        },
    });

    if (!member) throw new Error("MANAGER_PERMISSION_REQUIRED");

    const organizationId = member.organizationId;

    const [totalEquipmentAgg, borrowedCount, requestCount, brokenReportCount, recentRentals] =
        await Promise.all([
            prisma.equipment.aggregate({
                where: { organizationId },
                _sum: { totalQuantity: true },
            }),

            prisma.rental.count({
                where: { member: { organizationId }, status: "BORROWED" },
            }),

            prisma.rental.count({
                where: { member: { organizationId }, status: "REQUESTED" },
            }),

            prisma.report.count({
                where: { reporter: { organizationId }, type: "BROKEN", status: "PENDING" },
            }),

            prisma.rental.findMany({
                where: { member: { organizationId } },
                orderBy: { requestedAt: "desc" },
                take: 10,
                include: {
                    equipment: { select: { name: true } },
                    member: {
                        include: { user: { select: { name: true } } },
                    },
                },
            }),
        ]);

    const formattedRecentRentals = recentRentals.map(rental => {
        const month = String(rental.requestedAt.getMonth() + 1).padStart(2, "0");
        const day = String(rental.requestedAt.getDate()).padStart(2, "0");

        return {
            id: rental.id,
            equipment: rental.equipment.name,
            name: rental.member.user.name,
            date: `${month}.${day}`,
            status: rental.status,
        };
    });

    return {
        summary: {
            totalEquipment: totalEquipmentAgg._sum.totalQuantity || 0,
            borrowed: borrowedCount,
            requested: requestCount,
            brokenReports: brokenReportCount,
        },
        recentRentals: formattedRecentRentals,
    };
};

export default {
    getDashboardData,
};
