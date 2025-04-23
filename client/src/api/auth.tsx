import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/login`, credentials);
            // Token'ı localStorage'a kaydet
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue((error as any).response?.data?.message || 'Giriş başarısız');
        }
    }
);


const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, credentials);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue((error as any).response?.data?.message || 'Kayıt başarısız');
        }
    }
);


const getProfile = createAsyncThunk(
    'auth/profile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue((error as any).response?.data?.message || 'Profil bilgileri alınamadı');
        }
    }
);


export { loginUser, registerUser, getProfile };