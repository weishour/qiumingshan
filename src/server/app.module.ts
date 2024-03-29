import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { FileModule } from './modules/file/file.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostEntity } from './modules/post/post.entity';
import { UserEntity } from './modules/user/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOSTS'),
          port: configService.get('MYSQL_PORT'),
          username: configService.get('MYSQL_USERNAME'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DATABASE'),
          entities: [PostEntity, UserEntity],
          autoLoadEntities: true,
          // migrations: ['src/**/*.ts'],
          synchronize: true,
          charset: 'utf8mb4_unicode_ci',
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('EMAIL_SMTP_HOST'),
            port: configService.get('EMAIL_SMTP_PORT'),
            secure: configService.get('EMAIL_SMTP_SECURE'),
            auth: {
              user: configService.get('EMAIL_SMTP_USER'),
              pass: configService.get('EMAIL_SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: `"秋名山" <${configService.get('EMAIL_SMTP_USER')}>`,
          },
          template: {
            dir: path.join(__dirname, './templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          dest: configService.get('MULTER_DEST'),
        };
      },
      inject: [ConfigService],
    }),
    FileModule,
    PostModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
