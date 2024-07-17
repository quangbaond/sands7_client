import axios from "axios";
import { layer } from "@layui/layer-vue";
import { useRouter } from 'vue-router'
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});
const router = useRouter();


instance.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem("token");
        if (token) {
            token = token.replace(/"/g, "");
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            layer.msg("Đăng nhập hết hạn", { icon: 2 });
        }
        return Promise.reject(error);
    }
);

export default instance;
