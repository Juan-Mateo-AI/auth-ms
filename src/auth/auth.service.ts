import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { PrismaClient } from "@prisma/client";

import * as argon2 from "argon2";

import { DeleteUserDto, LoginUserDto, RegisterUserDto } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { envs } from "src/config";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger("AuthService");

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log("MongoDB connected");
  }

  async signJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: "Invalid token",
      });
    }
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: "User already exists",
        });
      }

      const newUser = await this.user.create({
        data: {
          email: email,
          password: await argon2.hash(password),
          name: name,
        },
      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await this.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: "User/Password not valid",
        });
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: "User/Password not valid",
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async deleteUser({ email }: DeleteUserDto) {
    try {
      return this.user.delete({
        where: { email },
      });
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getUser(email: string) {
    return this.user.findUnique({
      where: { email },
    });
  }

  async forgotPassword(email: string, password: string) {
    return this.user.update({
      where: { email },
      data: { password: await argon2.hash(password) },
    });
  }
}
