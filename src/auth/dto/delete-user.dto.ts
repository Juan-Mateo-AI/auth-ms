import { IsDefined, IsEmail, IsString } from "class-validator";

export class DeleteUserDto {
  @IsString()
  @IsEmail()
  @IsDefined()
  email: string;
}
