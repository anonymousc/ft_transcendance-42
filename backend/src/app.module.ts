import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module'
import { ProfilesController } from './profiles/profiles.controller';
import { ProfilesService } from './profiles/profiles.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [],
  controllers: [ProfilesController], // Must be here
  providers: [ProfilesService],      // Must be here
})
export class AppModule {}