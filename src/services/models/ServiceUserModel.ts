export type ServiceUserModel = {
    id: string,
    email: string,
    password: string,
    name: string,
    avatarUrl: string,
    dateOfBirth?: Date,
    createdAt: Date,
    updatedAt?: Date,
    bio?: string,
    location?: string,
    posts: string[],
    followers: string[],
    following: string[]
}
