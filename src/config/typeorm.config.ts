import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

export function TypeOrmDbConfig(): TypeOrmModuleOptions {
    const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;


    return {
        type: "postgres",
        port: +DB_PORT!,
        host: DB_HOST,
        database: DB_NAME,
        username: DB_USERNAME,
        password: DB_PASSWORD,
        synchronize: true,
        autoLoadEntities: false,
        entities: [
            "dist/**/**/**/*.entity{.ts,.js}",
            "dist/**/**/*.entity{.ts,.js}",
        ],
    }
}