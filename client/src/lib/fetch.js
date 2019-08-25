import axios from 'axios'

const { API_URL } = process.env

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 1000,
})

export default axiosInstance
