import "@babel/polyfill";
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// import { alerts } from "../../controllers/viewsController";
// import { showAlert } from "./alerts";

const loginForm = document.querySelector("#form");
const logoutBtn = document.querySelector(".nav__el--logout");
const saveSettings = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.querySelector("#book-tour");

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}
if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (saveSettings) {
  saveSettings.addEventListener("submit", e => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    if (document.getElementById("photo").files[0])
      form.append("photo", document.getElementById("photo").files[0]);
    updateSettings(form, "data");
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async e => {
    e.preventDefault();

    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );
    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

if (bookBtn) {
  bookBtn.addEventListener("click", e => {
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    //console.log(e.target.dataset);
    bookTour(tourId);
  });

  //alert("dkjfhlkdj");
}

// const alertMessage = document.querySelector("body").dataset.alert;
// if (alertMessage) showAlert("success", alertMessage, 10);
