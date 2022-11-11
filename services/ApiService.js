import axios from 'axios'

//const API_HOST = 'http://192.168.1.2/ss-web-back/site/api/af/servers.php'

const API_HOST = 'https://www.simplesolutions.com.ar/site/api/af/servers.php'

const APIKit = axios.create({
    baseURL: `${API_HOST}/`,
    timeout: 10000,
})

APIKit.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        return Promise.reject(error?.response?.data || error)
    },
)

const setClientToken = () => {
    APIKit.interceptors.request.use(async (config) => {
        const token = 'asd123asd123'
        config.headers.Authorization = `Bearer ${token}`
        return config
    })
}

setClientToken()

export default APIKit