import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { DeleteUserDto, LoginUserDto, RegisterUserDto } from "./dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern("auth.register.user")
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern("auth.login.user")
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @MessagePattern("auth.verify.user")
  verifyToken(@Payload() payload: any) {
    return this.authService.verifyToken(payload.token || payload);
  }

  @MessagePattern("auth.verify.user")
  deleteUser(@Payload() { email }: DeleteUserDto) {
    return this.authService.deleteUser({ email });
  }
}
