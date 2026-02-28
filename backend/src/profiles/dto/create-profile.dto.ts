import { IsString, isString, Length } from "class-validator";

export class CreatProfileDto
{
    @IsString()
    @Length(3)
    name : string;

    @IsString()
    description : string;
}