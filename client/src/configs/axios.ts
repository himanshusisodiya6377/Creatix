import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
    withCredentials: true,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
        // 'Origin': import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173',
    }
})

export default api