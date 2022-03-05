import { AuthProvider } from "@pankod/refine-core";
import { SDK } from '@directus/sdk-js';
import { IAuthenticateResponse } from '@directus/sdk-js/src/schemes/auth/Authenticate';

export const authProvider = (directus: any): AuthProvider => ({
    login: async ({ username, password }) => {
        try {
            const response: IAuthenticateResponse = await directus.login({ email: username, password: password });
            return response.data.token;
            // return Promise.resolve(response?.data?.token);
        } catch (e) {
            console.log(e);
            if (e instanceof Error) {
                throw e;
            }
            throw new Error("Invalid Email and password combination");
        }
    },
    logout: async () => {
        try {
            await directus.logout();
            return;
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                throw error;
            }
            return false;
        }
    },
    checkError: (error) => {
        if (error.status === 401) {
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: async () => {
        try {
            const response: boolean = await directus.isLoggedIn();
            if (response) {
                return Promise.resolve();
            } else {
                return Promise.reject();
            }
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return Promise.reject(error);
            }
            return Promise.reject(new Error("unable to check auth"));

        }
    },
    getPermissions: async () => {
        try {
            const response = await directus.getMyPermissions();
            return Promise.resolve(response);
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return Promise.reject(error);
            }
            return Promise.reject(new Error("unable to get permissions"));
        }
    },
    getUserIdentity: async () => {
        try {
            return directus.getMe();
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return Promise.reject(error);
            }
            return Promise.reject();
        }
    },
});