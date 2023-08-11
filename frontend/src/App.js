require("dotenv").config();
import React from "react";
// import "./App.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./checkoutForm";

const stripePromise = loadStripe(process.env.PublishableKey);
const App = () => {
  return (
    <div>
      <h1>Stripe Subscription Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default App;
