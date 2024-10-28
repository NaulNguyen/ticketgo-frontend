import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:8080';

const getToken = () => {
  return Cookies.get('jwt');
};

const axiosWithJWT = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosWithoutJWT = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosWithJWT.interceptors.request.use(
  (config) => {
    const jwt = getToken();
    if (jwt) {
      config.headers['Authorization'] = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosWithJWT, axiosWithoutJWT };
