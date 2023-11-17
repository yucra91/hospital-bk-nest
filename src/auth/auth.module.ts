import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from 'src/dasboard/user/entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports:[ ConfigModule ],
      inject:[ ConfigService ],
      useFactory: (configService: ConfigService )=> {
        // console.log('JWT secret',configService.get('JWT_SECRET'));
        // console.log('JWT SECRET',process.env.JWT_SECRET);
        
        return {
          secret: configService.get('JWT_SECRET') || 'S3Cr3T1234',
          signOptions: {
            expiresIn: '2h'
          }

        }
      }
    })

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h'
    //   }
    // })
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    AuthModule
  ]
})
export class AuthModule {}
