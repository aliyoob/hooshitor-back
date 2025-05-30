import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ServiceType } from "../enums/service.enum";

export class BuyServiceDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ enum: ServiceType })
    serviceType: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    conversationId: number | null;

}