// src/services/api.js

import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Error handler helper
const handleApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  if (error.response) {
    return {
      success: false,
      message: error.response.data.message || fallbackMessage,
      statusCode: error.response.status
    };
  } else if (error.request) {
    return {
      success: false,
      message: 'No response from server. Please check your connection.',
      statusCode: 0
    };
  } else {
    return {
      success: false,
      message: error.message || fallbackMessage,
      statusCode: 0
    };
  }
};

// Category Services
export const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch categories');
    }
  }
};

// Product Services
export const productService = {
  // Get all products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/products`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch products for category ${categoryId}`);
    }
  },
  
  // Get product details
  getProductDetails: async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch details for product ${productId}`);
    }
  }
};

// Customization Services
export const customizationService = {
  // Get customization options for a product
  getCustomizationOptions: async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}/customization`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch customization options for product ${productId}`);
    }
  }
};

// Order Services
export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create order');
    }
  },
  
  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to get status for order ${orderId}`);
    }
  }
};