import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Avatar,
  Box,
  CardActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { read } from "./api-shop.js";
import { listByShop } from "../product/api-product.js";
import AddToCart from "../cart/AddToCart";

 
export default function ShopProduct() {
  const params = useParams();
  const theme = useTheme();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
 
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
 
    read({ shopId: params.shopId }, signal).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setShop(data);
      }
    });
 
    listByShop({ shopId: params.shopId }, signal).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data);
      }
    });
 
    return () => abortController.abort();
  }, [params.shopId]);
 
  if (error) {
    return (
      <Typography color="error" sx={{ m: 4 }}>
        {error}
      </Typography>
    );
  }
 
  return (
    <Box sx={{ flexGrow: 1, m: 2 }}>
      {/* Shop Info Header */}
      {shop && (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            src={`/api/shops/logo/${shop._id}?${new Date().getTime()}`}
            sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            {shop.name}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            {shop.description}
          </Typography>
        </Box>
      )}
 
      {/* Products Grid */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ maxWidth: "1400px", margin: "auto" }}
      >
        {products.map((product) => {
          const imageUrl = `/api/product/image/${product._id}?${new Date().getTime()}`;
          return (
            <Grid
              item
              key={product._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card sx={{ width: "100%", maxWidth: 450, textAlign: "center" }}>
                <CardMedia
                  component="img"
                  sx={{
                    height: { xs: 200, sm: 220, md: 250, lg: 300 },
                    objectFit: "cover",
                  }}
                  image={imageUrl}
                  alt={product.name}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: theme.palette.primary.main }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: theme.palette.text.secondary }}
                  >
                    {product.description}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Price: ${product.price}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Quantity: {product.quantity}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", mb: 2 }}>
        <AddToCart item={product} />
        </CardActions>

                            </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

