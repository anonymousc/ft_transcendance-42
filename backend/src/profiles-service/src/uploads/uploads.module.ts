import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/avatars',
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, PrismaService],
})
export class UploadsModule {}
