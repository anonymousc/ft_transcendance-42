import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('uploads')
export class UploadsController 
{
    constructor(private uploadsService: UploadsService) {}

    @Post('avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,  // Get request object to access user info
    ) 
    {
        const user = req.user as { id: string };
        return this.uploadsService.uploadAvatar(file, user.id);
    }
}
