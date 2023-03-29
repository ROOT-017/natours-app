import axios from "axios";
import { showAlert } from "./alerts";
// const stripe = stripe(
//   "pk_test_51Mqej8Gv3gaInAzwZkdi1TtctG245z0yI2jyo7g4BFl4V51mmRi2lrw0QrfARch6uHdO7312L7sXuu5h908VFlL200RTzBRLaX"
// );

export const bookTour = async tourId => {
  //1) Get checkout session for API
  try {
    const session = await axios({
      method: "GET",
      url: `/api/v1/bookings/checkout-session/:${tourId}}`,
    });
    //2) CReate checkout form
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    showAlert(err);
  }
};
