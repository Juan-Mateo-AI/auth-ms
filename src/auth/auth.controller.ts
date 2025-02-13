import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { DeleteUserDto, ForgotPasswordDto, LoginUserDto, RegisterUserDto } from "./dto";

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

  @MessagePattern("auth.delete.user")
  deleteUser(@Payload() { email }: DeleteUserDto) {
    return this.authService.deleteUser({ email });
  }

  @MessagePattern("auth.get.user")
  getUser(@Payload() {email}: {email: string}) {
    return this.authService.getUser(email);
  }

  @MessagePattern("auth.user.forgotPassword")
  forgotPassword(@Payload() { email, password }: ForgotPasswordDto) {
    return this.authService.forgotPassword(email, password);
  }
}
