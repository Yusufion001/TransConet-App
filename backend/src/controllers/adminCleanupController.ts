import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

export const legacyCleanup = async (req: Request, res: Response): Promise<any> => {
  try {
    const admins = await prisma.adminUser.findMany();
    
    const keepEmails = [
      'superadmin@transconet.com',
      'backupadmin@transconet.com',
      'yusufjimoh969@gmail.com',
      'platform@transconet.com',
      'finance@transconet.com',
      'support@transconet.com',
      'compliance@transconet.com'
    ];
  
    const report: any = {
      normalized: [],
      archived: [],
      errors: []
    };
  
    for (const admin of admins) {
      try {
        const emailLower = admin.email.toLowerCase();
        
        if (admin.email !== emailLower) {
          const existing = await prisma.adminUser.findUnique({ where: { email: emailLower } });
          if (existing && existing.id !== admin.id) {
             await prisma.adminUser.update({
                where: { id: admin.id },
                data: { isActive: false, email: `${admin.email}_archived_${Date.now()}` }
             });
             report.normalized.push(`Duplicate lowercased for ${admin.email}, archived as ${admin.email}_archived`);
          } else {
             await prisma.adminUser.update({
                where: { id: admin.id },
                data: { email: emailLower }
             });
             report.normalized.push(`Normalized ${admin.email} to ${emailLower}`);
          }
        }
        
        if (!keepEmails.includes(emailLower) && admin.isActive) {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { isActive: false }
          });
          report.archived.push(`Archived legacy admin: ${emailLower}`);
        }
      } catch (err: any) {
        report.errors.push(`Error processing ${admin.email}: ${err.message}`);
      }
    }
  
    return res.status(200).json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
