import { IsMobilePhone, IsString, Length } from "class-validator";

export class SendOtpDto {
    @IsMobilePhone("fa-IR")
    mobile: string;
}

export class CheckOtpDto {
    @IsMobilePhone("fa-IR")
    mobile: string;

    @IsString()
    @Length(5, 5)
    code: string;
}