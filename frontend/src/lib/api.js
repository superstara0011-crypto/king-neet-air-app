import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// ✅ Automatically attach session token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("session_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export const LEVEL_COLORS = {
    "Seed": "#88FF88",
    "Aspirant": "#00FFCC",
    "Scholar": "#00A3FF",
    "Warrior": "#B900FF",
    "Champion": "#FF007A",
    "KING NEET": "#FF3B30",
    "AIR LEGEND": "#FFD700",
};

export const SUBJECT_COLORS = {
    biology: "#39FF14",
    physics: "#00F0FF",
    chemistry: "#B900FF",
};

export const SUBJECT_LABEL = {
    biology: "Biology",
    physics: "Physics",
    chemistry: "Chemistry",
};
