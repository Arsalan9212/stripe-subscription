import React, { useState } from "react";
import axios from "axios";
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const [product, setProduct] = useState({
    name: "Arsalan",
    priceId: "price_1NQXaAGf9L1hAizczYtql5PE",
    productId: "makeIdForProduct",
  });
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState();
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    // const cardElement = elements.getElement(CardElement);
    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
      email: email,
    });

    if (error) {
      console.log("Error", error);
      return;
    }

    const { data: customerData } = await axios.post(
      "http://localhost:3000/api/create-customer",
      {
        email: email,
        product: product,
      }
    );

    const { data: subscriptionData } = await axios.post(
      "http://localhost:3000/api/create-subscription",
      {
        customerId: customerData.customerId,
        email: email,
        product: product,
        paymentMethodId: paymentMethod.id,
      }
    );

    setProcessing(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {/* <CardElement /> */}
      <label>
        Card Number
        <CardNumberElement />
      </label>
      <label>
        Expiration Date
        <CardExpiryElement />
      </label>
      <label>
        CVC
        <CardCvcElement />
      </label>
      <button type="submit" disabled={!stripe || processing}>
        Pay
      </button>
    </form>
  );
};

export default CheckoutForm;
