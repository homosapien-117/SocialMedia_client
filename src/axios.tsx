import axios, { AxiosInstance } from "axios";

const token = JSON.parse(localStorage.getItem("user_data") as string);
console.log(token);

const admintoken = JSON.parse(localStorage.getItem("admin_data") as string);
console.log(admintoken);
const Axios: AxiosInstance = axios.create({
  baseURL: "https://socialmedia-server-zflk.onrender.com/api",  //http://localhost:4000/api/
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
// Axios.defaults.headers.common["Authorization"] = token?.userToken;

const AdminAxios: AxiosInstance = axios.create({
  baseURL: "https://socialmedia-server-zflk.onrender.com", //http://localhost:4000/api/
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

AdminAxios.defaults.headers.common["Authorization"] = admintoken?.adminToken;

export const setupAxiosInterceptors = (logout: () => void) => {
  Axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error);

      if (error.response?.status == 401) {
        window.location.href = "/login";
        console.error("Unauthorized, redirecting...");
      } else if (error.response?.status === 500) {
        console.error("Server error, please try again later.");
      } else if (error.response?.status == 403) {
        console.log("haloooo");
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

export { Axios, AdminAxios };
