import { Request, Response } from 'express';
import { prisma } from '../../db/prisma';
import bcrypt from 'bcryptjs';

export const getAdmins = async (req: Request, res: Response): Promise<any> => {
  try {
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins.' });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const existingUser = await prisma.adminUser.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Admin with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: { id: true, email: true, role: true }
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
};

export const updateAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { email, password, role, isActive } = req.body;

    const data: any = {};
    if (email) data.email = email;
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, isActive: true }
    });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin.' });
  }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Check if trying to delete the last SUPER_ADMIN
    const adminToDelete = await prisma.adminUser.findUnique({ where: { id } });
    if (adminToDelete?.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.adminUser.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last SUPER_ADMIN.' });
      }
    }

    await prisma.adminSession.deleteMany({ where: { adminUserId: id } });
    await prisma.adminUser.delete({ where: { id } });
    
    res.json({ message: 'Admin deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete admin.' });
  }
};
