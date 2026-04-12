import { IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(3)
  name: string;

  @IsString()
  description: string;
}
