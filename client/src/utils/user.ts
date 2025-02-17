import { PRICE_SCALE } from '@/constants/common';
import { loginOut } from '@/api/user';

const tokenKey = 'token';
export const clearToken = () => {
  try {
    loginOut();
    localStorage.removeItem(tokenKey);
  } catch (error) {
    error;
  }
};

export const setToken = (token: string) => {
  localStorage.setItem(tokenKey, token);
};
export const getToken = () => {
  return localStorage.getItem(tokenKey) || '';
};

/**
 * Convert the price read from the database into yuan
 */
export const formatPrice = (val = 0, multiple = 1) => {
  return Number(((val / PRICE_SCALE) * multiple).toFixed(10));
};
