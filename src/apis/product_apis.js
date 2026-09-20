import axiosInstance from "../apis/axiosInstance";
const API_URL = "https://e-commerce-zhu2.onrender.com";

export const getCustomerData = async () => {
  return await axiosInstance.get(`${API_URL}/is-complete/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

export const getProductsByCategory = () => {
  return axiosInstance.get(`${API_URL}/products-by-category/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

/* ADD TO CART */
export const addToCart = (product_id, quantity = 1) => {
  return axiosInstance.post(
    `${API_URL}/cart/add/`,
    {
      product_id,
      quantity,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    },
  );
};

/* BUY PRODUCT */
export const buyProduct = (product_id, quantity = 1,address) => {
  return axiosInstance.post(
    `${API_URL}/buy/`,
    {
      product_id,
      quantity,
      address
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    },
  );
};

export const makePayment = (order_id, payment_mode) => {
  return axiosInstance.post(`${API_URL}/payment/`, {
    order_id,
    payment_mode,
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

export const getOrders = () => {
  return axiosInstance.get(`${API_URL}/orders/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}