import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module'
import { ProfilesController } from './profiles/profiles.controller';
import { ProfilesService } from './profiles/profiles.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [AuthModule, ProfilesModule],
  // controllers: [AuthController, ProfilesController], 
  // providers: [AuthService ,ProfilesService],  
})
export class AppModule {}