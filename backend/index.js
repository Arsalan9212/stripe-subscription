const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51EudArGf9L1hAizcVu9RdY61mU3BAE0hiTKwrHUzhStV8LtklvT6V9aaJO6e4ZUIB9w0OZyUNteKh6M1KBOYb7My00QR48tUYi"
);

const app = express();
app.use(express.json());
app.use(cors());

// Create a customer in Stripe
app.post("/api/create-customer", async (req, res) => {
  try {
    const { email } = req.body;
    let customer = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({
        email: email,
      });
      console.log("new customer is created", customer.id);
      return res.json({ customerId: customer.id });
    } else {
      customer = customer.data[0];
      return res.json({ customerId: customer.id });
      console.log("this is already created");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create a subscription for a customer
app.post("/api/create-subscription", async (req, res) => {
  const { product, customerId, paymentMethodId } = req.body;
  try {
    let customer = await stripe.customers.retrieve(customerId);
    // If the customer does not have a default payment method, attach the provided payment method
    if (!customer.invoice_settings.default_payment_method) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: product.priceId }],
      currency: "usd",
    });
    console.log(
      "🚀 ~ file: index.js:34 ~ app.post ~ subscription:",
      subscription
    );

    res.json({ subscriptionId: subscription.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
