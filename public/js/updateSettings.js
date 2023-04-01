import axios from "axios";
import { showAlert } from "./alerts";
//type is either 'data or password
export const updateSettings = async (data, type) => {
  let url;
  try {
    if (process.env.NODE_ENV === "production")
      url =
        type === "password"
          ? `https://natours-app-7j5x.onrender.com/api/v1/users/updatemypassword` //changed
          : `https://natours-app-7j5x.onrender.com/api/v1/users/updateme`;
    if (process.env.NODE_ENV === "development")
      url =
        type === "password"
          ? "http://127.0.0.1:3000/api/v1/users/updatemypassword"
          : "http://127.0.0.1:3000/api/v1/users/updateme";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        `${type === "password" ? "Password" : "Bio data"} updated succcessfully`
      );
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
