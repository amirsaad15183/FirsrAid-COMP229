import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Paper,
  Divider,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { Grid } from "@mui/material";
//import { Elements } from "@stripe/react-stripe-js";
//import StripePlaceOrder from "./StripePlaceOrder";
import cart from "./cart-helper";
//import {ElementsConsumer } from "@stripe/react-stripe-js";

const Checkout = () => {
  const [checkoutDetails, setCheckoutDetails] = useState({
    products: [],
    total: 0,
  });

  const [shipping, setShipping] = useState({
    name: "",
    email: "", // ✅ added email here
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({ ...shipping });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const cartItems = cart.getCart();
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setCheckoutDetails({ products: cartItems, total: totalAmount });
  }, []);

  useEffect(() => {
    if (billingSameAsShipping) {
      setBilling({ ...shipping });
    }
  }, [shipping, billingSameAsShipping]);

  const handleCouponApply = () => {
    if (couponCode.trim().toLowerCase() === "save10") {
      setDiscount(10);
    } else {
      setDiscount(0);
    }
  };

  const finalTotal = Math.max(0, checkoutDetails.total - discount);

  /*const mergedCheckoutDetails = {
    ...checkoutDetails,
    shipping,
    billing: billingSameAsShipping ? shipping : billing,
    discount,
    finalTotal,
  };
*/
    
  return (
    <Paper sx={{ padding: 4, maxWidth: 700, margin: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Checkout
      </Typography>
      <Divider sx={{ my: 2 }} />

      {/* Cart Summary */}
      <Box sx={{ mb: 3 }}>
        {checkoutDetails.products.length === 0 ? (
          <Typography>Your cart is empty.</Typography>
        ) : (
          checkoutDetails.products.map((product, index) => (
            <Typography key={index}>
              {product.product.name} × {product.quantity} — $
              {product.product.price * product.quantity}
            </Typography>
          ))
        )}
        <Divider sx={{ my: 2 }} />
        <Typography>Total: ${checkoutDetails.total.toFixed(2)}</Typography>
        {discount > 0 && (
          <Typography color="success.main">
            Discount: -${discount.toFixed(2)}
          </Typography>
        )}
        <Typography variant="h6">
          Final Total: ${finalTotal.toFixed(2)}
        </Typography>
      </Box>

      {/* Coupon */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
        />
        <Button onClick={handleCouponApply} variant="outlined">
          Apply Coupon
        </Button>
      </Box>

      {/* Shipping Address */}
      <Typography variant="h6" gutterBottom>
        Shipping Address
      </Typography>
      <Box sx={{ mb: 3 }}>
        {["name", "email", "address", "city", "postalCode", "country"].map(
          (field) => (
            <TextField
              key={field}
              type={field === "email" ? "email" : "text"} // ✅ ensures email input
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={shipping[field]}
              onChange={(e) =>
                setShipping({ ...shipping, [field]: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
          )
        )}
      </Box>

      {/* Billing Address */}
      <FormControlLabel
        control={
          <Checkbox
            checked={billingSameAsShipping}
            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
          />
        }
        label="Billing address is the same as shipping"
      />
      {!billingSameAsShipping && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Billing Address
          </Typography>
          <Box sx={{ mb: 3 }}>
            {["name", "address", "city", "postalCode", "country"].map(
              (field) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={billing[field]}
                  onChange={(e) =>
                    setBilling({ ...billing, [field]: e.target.value })
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
              )
            )}
          </Box>
        </>
      )}
     
          
        
      
      <Link to="/placeOrder" style={{ textDecoration: "none" }}>
        <Button color="secondary" variant="contained" onClick={"/placeOrder"}>
          placeOrder
        </Button>
          </Link>
          
    </Paper>
  );
};

export default Checkout;

