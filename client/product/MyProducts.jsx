import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardMedia,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemSecondaryAction,
  Divider,
  Icon,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Link } from "react-router-dom";
import { listByShop } from "./api-product.js";
import DeleteProduct from "./DeleteProduct.jsx";

export default function MyProducts(props) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    listByShop({ shopId: props.shopId }, signal).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setProducts(data);
      }
    });

    return () => {
      abortController.abort();
    };
  }, [props.shopId]);

  const removeProduct = (product) => {
    const updatedProducts = [...products];
    const index = updatedProducts.indexOf(product);
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  return (
    <Card
      sx={{
        p: 3,
        mt: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Products
        <Link
          to={`/seller/${props.shopId}/products/new`}
          style={{ textDecoration: "none" }}
        >
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddBoxIcon />}
          >
            New Product
          </Button>
        </Link>
      </Typography>

      <List dense>
        {products.map((product, i) => (
          <span key={i}>
            <ListItem alignItems="flex-start" sx={{ alignItems: "center" }}>
              <CardMedia
                component="img"
                sx={{ width: 110, height: 100, mr: 2 }}
                image={`/api/product/image/${
                  product._id
                }?${new Date().getTime()}`}
                alt={product.name}
              />
              <div>
                <Typography variant="subtitle1" color="primary">
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Quantity: {product.quantity} | Price: ${product.price}
                </Typography>
              </div>
              <ListItemSecondaryAction>
                <Link
                  to={`/seller/${product.shop._id}/${product._id}/edit`}
                  style={{ marginRight: 8 }}
                >
                  <IconButton aria-label="Edit" color="primary">
                    <EditIcon />
                  </IconButton>
                </Link>
                <DeleteProduct
                  product={product}
                  shopId={props.shopId}
                  onRemove={removeProduct}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </span>
        ))}
      </List>
    </Card>
  );
}

MyProducts.propTypes = {
  shopId: PropTypes.string.isRequired,
};

