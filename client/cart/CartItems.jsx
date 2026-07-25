import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import cart from "./cart-helper.js";
import auth from "./../lib/auth-helper";

export default function CartItems(props) {
  const [cartItems, setCartItems] = useState(cart.getCart());

  const handleChange = (index) => (event) => {
    let updatedCartItems = cartItems;
    const quantity = parseInt(event.target.value, 10);
    updatedCartItems[index].quantity = quantity >= 1 ? quantity : 1;
    setCartItems([...updatedCartItems]);
    cart.updateCart(index, quantity >= 1 ? quantity : 1);
  };

  const getTotal = () => {
    return cartItems.reduce((a, b) => a + b.quantity * b.product.price, 0);
  };

  const removeItem = (index) => () => {
    let updatedCartItems = cart.removeItem(index);
    if (updatedCartItems.length === 0) {
      props.setCheckout(false);
    }
    setCartItems(updatedCartItems);
  };

  const openCheckout = () => {
    props.setCheckout(true);
  };

  return (
    <Card sx={{ margin: 3, padding: 3, backgroundColor: "#f5f5f5" }}>
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        Shopping Cart
      </Typography>

      {cartItems.length > 0 ? (
        <>
          {cartItems.map((item, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Card sx={{ display: "flex", backgroundColor: "#fff" }}>
                <CardMedia
                  component="img"
                  image={`/api/product/image/${item.product._id}`}
                  alt={item.product.name}
                  sx={{ width: 160, height: 125, m: 1 }}
                />
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 1,
                  }}
                >
                  <CardContent sx={{ flex: "1 0 auto", p: 0 }}>
                    <Link
                      to={`/product/${item.product._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography variant="h6" color="primary">
                        {item.product.name}
                      </Typography>
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      ${item.product.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shop: {item.product.shop.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                      Subtotal: ${item.product.price * item.quantity}
                    </Typography>
                  </CardContent>

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={handleChange(i)}
                      inputProps={{ min: 1 }}
                      size="small"
                      sx={{ width: 60 }}
                    />
                    <Button color="primary" onClick={removeItem(i)}>
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Card>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}

          {/* Total and Checkout Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
              mt: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2em",
                fontWeight: 600,
                color: "rgb(53, 97, 85)",
              }}
            >
              Total: ${getTotal()}
            </Typography>

            {!props.checkout && auth.isAuthenticated() ? (
                <Link to="/checkout" style={{ textDecoration: "none" }}>

              <Button
                color="secondary"
                variant="contained"
                onClick={openCheckout}
              >
                Checkout
              </Button>
                </Link>
            ) : (
              <Link to="/signin" style={{ textDecoration: "none" }}>
                <Button color="primary" variant="contained">
                  Sign in to checkout
                </Button>
              </Link>
            )}

            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="contained">Continue Shopping</Button>
            </Link>
          </Box>
        </>
      ) : (
        <Typography variant="subtitle1" color="primary">
          No items added to your cart.
        </Typography>
      )}
    </Card>
  );
}

CartItems.propTypes = {
  checkout: PropTypes.bool.isRequired,
  setCheckout: PropTypes.func.isRequired,
};

