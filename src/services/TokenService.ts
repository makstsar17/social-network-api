import { client } from "../config/db"

export const TokenService = {
    isTokenBlacklisted: async (token: string): Promise<boolean> => {
        const result = await client.get(token);
        return result !== null;
    },
    setTokenToBlackList: async (refreshToken: string, expiresIn: number) => {
        await client.set(refreshToken, "blacklisted");
        await client.expire(refreshToken, expiresIn);
    }
}