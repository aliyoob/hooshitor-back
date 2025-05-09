import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
    App = "App",
    Db = "Db",
    Jwt = "Jwt",
    Sms = "Sms",
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
    port: 3000,
}))

const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
    accessTokenSecret: "5224019d8029c49190beaf31a540e9cc0bb8715d",
    refreshTokenSecret: "cabbcc4ba9969e1d70decdbeb04c596ae09a1e79",
}))

const SmsConfig = registerAs(ConfigKeys.Sms, () => ({
    smsApiToken: "4D676179452B764C4D3141774639786D416B4E34346E564E656B62684B423050724C35586F5A62774D56413D",
}))

const DbConfig = registerAs(ConfigKeys.Db, () => ({
    port: 5432,
    host: "localhost",
    username: "alireza",
    password: "eng000747",
    database: "auth-otp"
}))

export const configurations = [AppConfig, DbConfig, JwtConfig, SmsConfig]