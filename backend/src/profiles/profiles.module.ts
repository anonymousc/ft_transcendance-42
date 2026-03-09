import { Module} from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
// Import PrismaService so we can register it as a provider
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProfilesController],
  // Add PrismaService to providers array - this tells NestJS to create an instance
  // that can be injected into ProfilesService's constructor
  providers: [ProfilesService, PrismaService]
})
export class ProfilesModule {}
