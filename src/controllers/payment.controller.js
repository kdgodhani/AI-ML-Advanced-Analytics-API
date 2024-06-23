const { getProductByIds } = require("../controllers/product.controller");

const { STRIPE_SECRET_KEY, REACT_BASE_URL } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const paymentCheckout = async (req, res) => {
  try {
    const productRequests = req.body;
    const products = [];
    for (const request of productRequests) {
      const productDoc = await getProductByIds(request.id);
      const product = productDoc.toObject();
      products.push({ ...product, quantity: request.quantity });
    }

    // Map the products array to the format required by Stripe
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
          description: product.description,
          images: [product.Image],
        },
        unit_amount: product.price * 100, // Stripe expects the amount in cents
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${REACT_BASE_URL}/payment/success`,
      cancel_url: `${REACT_BASE_URL}/payment/failure`,
    });

    return res.status(200).json({
      success: true,
      message: "Payment Successfull",
      response: session,
    });
  } catch (error) {
    console.log(error, " payment.contorller -> paymentCheckOut");
    next(error);
  }
};

module.exports = {
  paymentCheckout,
};
