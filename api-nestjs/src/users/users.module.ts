import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký User Entity
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}