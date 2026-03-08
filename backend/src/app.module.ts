import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfilesModule } from './profiles/profiles.module'
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ProfilesModule,
    UploadsModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}