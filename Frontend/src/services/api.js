import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auto-attach token dari localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 handling is in stores/auth.js

export default api

// Resolve relative image URLs to absolute backend URLs
// Backend stores "/uploads/products/..." → frontend needs full URL
const API_BASE = import.meta.env.VITE_API_URL || '/api'
const BACKEND_URL = API_BASE.replace(/\/api\/?$/, '') || ''

export function getImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return BACKEND_URL + url
}
