import React, { useState } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import AddCartIcon from "@mui/icons-material/AddShoppingCart";
import DisabledCartIcon from "@mui/icons-material/RemoveShoppingCart";
import cart from "./cart-helper.js";
import { Navigate } from "react-router-dom";

export default function AddToCart({ item, cartStyle }) {
  const [redirect, setRedirect] = useState(false);

  const addToCart = () => {
    cart.addItem(item, () => {
      setRedirect(true); // just a boolean
    });
  };

  if (redirect) {
    return <Navigate to="/cartItems" />;
  }

  return (
    <span>
      {item.quantity > 0 ? (
        <IconButton
          color="secondary"
          onClick={addToCart}
          sx={{ width: "28px", height: "28px" }}
        >
          <AddCartIcon sx={cartStyle || { width: "28px", height: "28px" }} />
        </IconButton>
      ) : (
        <IconButton
          disabled
          color="secondary"
          sx={{
            width: "28px",
            height: "28px",
            color: "#7f7563",
          }}
        >
          <DisabledCartIcon
            sx={cartStyle || { width: "28px", height: "28px" }}
          />
        </IconButton>
      )}
    </span>
  );
}

AddToCart.propTypes = {
  item: PropTypes.object.isRequired,
  cartStyle: PropTypes.object,
};

