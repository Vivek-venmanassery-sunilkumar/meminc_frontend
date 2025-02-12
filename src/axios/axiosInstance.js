import axios from "axios";

const BASE_URL = 'http://localhost:8000/'

const api = axios.create({
    baseURL: 'http://localhost:8000/',
    withCredentials: true,
})

export default api 
export {BASE_URL} 