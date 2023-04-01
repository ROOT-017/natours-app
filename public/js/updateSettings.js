import axios from "axios";
import { showAlert } from "./alerts";
//type is either 'data or password
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? `/api/v1/users/updatemypassword`
        : `/api/v1/users/updateme`;

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
