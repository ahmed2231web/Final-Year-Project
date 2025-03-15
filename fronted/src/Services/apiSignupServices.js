import axios from 'axios';

const API_URL = 'http://localhost:8000/auth';

export async function signup(user) {
  delete user.confirmPassword;
  
  try {
    const response = await axios.post(`${API_URL}/register/`, user);
    return response.data;
  } catch (error) {
    console.error("Error during signup:", error);
    throw new Error(error.response?.data?.message || "User registration failed");
  }
}
