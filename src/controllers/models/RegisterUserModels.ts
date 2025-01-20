export type RegisterUserRequestModel = {
    email: string;
    password: string;
    name: string
}

export type RegisterUserResponseModel = {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    avatarUrl: string;
}