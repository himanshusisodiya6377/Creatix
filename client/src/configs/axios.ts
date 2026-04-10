import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'https://creatix-backend.onrender.com',
    withCredentials: true,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
})

export default api