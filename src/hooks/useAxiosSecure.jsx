import axios from 'axios';
import React from 'react';

const axiosSecure = axios.create({
  baseURL: "https://rootx-coaching-management-server-si.vercel.app"
})

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;