import { IsDefined, IsEmail, IsString, IsStrongPassword } from "class-validator";

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @IsDefined()
  @IsStrongPassword()
  password: string;
}
