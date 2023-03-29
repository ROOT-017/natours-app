import axios from "axios";
import { showAlert } from "./alerts";
export const login = async (email, password) => {
  
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
  console.log(res);
};

export const logout = async () => {
  const res = await axios({
    method: "GET",
    url: `/api/v1/users/logout`,
  });

  if (res.data.status === "success") location.assign("/");
  try {
  } catch (err) {
    showAlert("error", "We had a problem logging you out😥️. Try again");
  }
};
