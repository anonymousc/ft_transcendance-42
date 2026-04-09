import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/avatars',
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (_req, file, cb) => {
        const allowed = new Set([
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ]);
        if (!allowed.has(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        return cb(null, true);
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, PrismaService],
})
export class UploadsModule {}
