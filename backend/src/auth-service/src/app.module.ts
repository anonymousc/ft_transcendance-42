import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Controller, Get } from '@nestjs/common';

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'auth' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
