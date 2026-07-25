import React, { useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { list } from "./api-shop.js";
import { Link } from "react-router-dom";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchShops = async () => {
      try {
        const data = await list(signal);
        if (data && data.error) {
          setError(data.error);
        } else if (data) {
          setShops(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError("Failed to load shops.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShops();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        padding: 3,
        mt: 5,
        mb: 3,
        bgcolor: "background.paper",
      }}
      component={Paper}
      elevation={4}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          color: "text.primary",
          textAlign: "center",
          mb: 2,
          fontWeight: "bold",
        }}
      >
        All Shops
      </Typography>

      {loading && (
        <Typography variant="body1" align="center">
          Loading shops...
        </Typography>
      )}

      {error && (
        <Typography variant="body1" align="center" color="error">
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <List dense>
          {shops.map((shop, i) => (
            <React.Fragment key={shop._id || i}>
              <ListItem
                button
                alignItems="flex-start"
                component={Link}
                to={`/shops/${shop._id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={`/api/shops/logo/${shop._id}?${new Date().getTime()}`}
                    alt={shop.name}
                  >
                    {shop.name?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ pl: 2, py: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    color="primary"
                    sx={{ mb: 0.5 }}
                  >
                    {shop.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-line" }}
                  >
                    {shop.description}
                    <Link
                      to="/shops/:shopId"
                      style={{ textDecoration: "none" }}
                    ></Link>
                  </Typography>
                  <Typography>
                    <Link
                      to="/shops/product"
                      style={{ textDecoration: "none" }}
                    ></Link>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-line" }}
                  ></Typography>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

