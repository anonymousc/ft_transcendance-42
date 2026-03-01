import { IsString, IsOptional, Length, MaxLength, Matches } from "class-validator";

export class UpdateProfileDto
{
    @IsOptional()
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores'
    })
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    displayName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}