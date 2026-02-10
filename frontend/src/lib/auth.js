import { apiFetch } from './api.js';

export async function register(userData) {
  return apiFetch('/register', 'POST', userData);
}

export async function login(credentials) {
  return apiFetch('/login', 'POST', credentials);
}

export function storeToken(token) {
  localStorage.setItem('authToken', token);
}

export function getToken() {
  return localStorage.getItem('authToken');
}

export function logout() {
  localStorage.removeItem('authToken');
}
