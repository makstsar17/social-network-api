export type RegisterUserRequestModel = {
    email: string;
    password: string;
    name: string
}

export type RegisterUserResponseModel = {
    email: string;
    name: string;
    createdAt: Date;
    avatarUrl: string;
}