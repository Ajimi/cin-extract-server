import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [TypeOrmModule.forRoot(), MulterModule.register({
    dest: './files',
  }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
