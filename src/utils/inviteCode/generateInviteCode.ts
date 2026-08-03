import prisma from "../../config/prisma.ts";

export const generateRandomCode = (length = 10): string => {
    const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let code = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * char.length);
        code += char[randomIndex];
    }

    return code;
};

export const generateUniqueInviteCode = async (): Promise<string> => {
    let inviteCode = "";
    let isUnique = false;

    while (!isUnique) {
        inviteCode = generateRandomCode(10);
        const existingOrganization = await prisma.organization.findUnique({
            where: { inviteCode },
        });

        if (!existingOrganization) {
            isUnique = true;
        }
    }

    return inviteCode;
};
