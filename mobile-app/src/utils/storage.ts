import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'gt_auth_token';
const USER_KEY = 'gt_user_data';

export const storeToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const storeUser = async (user: object): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<any | null> => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const removeUser = async (): Promise<void> => {
    await AsyncStorage.removeItem(USER_KEY);
};

export const clearAll = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
};
