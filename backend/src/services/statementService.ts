import { prisma } from "../db/prisma";

export async function getUserActivityStatement(userId: string) {
  try {
    const statementData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        transporterProfile: {
          select: {
            companyName: true,
            isVerified: true,
            rating: true,
          }
        },
        vehicles: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            brand: true,
            vehicleType: true,
            plateNumber: true,
            capacityTons: true,
            isVerified: true,
          }
        },
        loadPostings: {
          take: 100, // Limit payload size over network
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            cargoType: true,
            weightKg: true,
            origin: true,
            destination: true,
            status: true,
            createdAt: true,
          }
        },
        bids: {
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            load: {
              select: {
                id: true,
                title: true,
                origin: true,
                destination: true,
                status: true,
              }
            }
          }
        }
      }
    });

    if (!statementData) {
      throw new Error("User statement not found");
    }

    return statementData;
  } catch (error: any) {
    console.error(`[getUserActivityStatement] Network/DB Error for user ${userId}:`, error.message);
    throw new Error('Failed to securely fetch user activity statement. Please try again later.');
  }
}
