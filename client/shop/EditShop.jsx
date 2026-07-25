import React, { useEffect, useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  Typography,
  Icon,
  Avatar,
  Grid,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useTheme } from "@mui/material/styles";
import auth from "../lib/auth-helper";
import { read, update } from "./api-shop.js";
import { Navigate, useParams } from "react-router-dom";
import MyProducts from "../product/MyProducts";


export default function EditShop() {
  const params = useParams();
  const theme = useTheme();
  const [values, setValues] = useState({
    name: "",
    description: "",
    image: "",
    redirect: false,
    error: "",
    id: "",
    owner: "",
  });

  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read({ shopId: params.shopId }, signal).then((data) => {
      if (data.error) {
        setValues((prev) => ({ ...prev, error: data.error }));
      } else {
        setValues((prev) => ({
          ...prev,
          id: data._id,
          name: data.name,
          description: data.description,
          owner: data.owner.name,
        }));
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [params.shopId]);

  const clickSubmit = () => {
    let shopData = new FormData();
    values.name && shopData.append("name", values.name);
    values.description && shopData.append("description", values.description);
    values.image && shopData.append("image", values.image);

    update({ shopId: params.shopId }, { t: jwt.token }, shopData).then(
      (data) => {
        if (data.error) {
          setValues((prev) => ({ ...prev, error: data.error }));
        } else {
          setValues((prev) => ({ ...prev, redirect: true }));
        }
      }
    );
  };

  const handleChange = (name) => (event) => {
    const value = name === "image" ? event.target.files[0] : event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const logoUrl = values.id
    ? `/api/shops/logo/${values.id}?${new Date().getTime()}`
    : "/api/shops/defaultphoto";

  if (values.redirect) {
    return <Navigate to="/seller/shops" />;
  }

  return (
    <Grid container spacing={8} sx={{ flexGrow: 1, m: 4 }}>
      <Grid item xs={12} sm={6}>
        <Card sx={{ textAlign: "center", pb: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              component="h2"
              sx={{ mt: 2, color: theme.palette.primary.main }}
            >
              Edit Shop
            </Typography>

            <Avatar
              src={logoUrl}
              sx={{ width: 60, height: 60, mx: "auto", my: 2 }}
            />

            <input
              accept="image/*"
              onChange={handleChange("image")}
              id="icon-button-file"
              type="file"
              style={{ display: "none" }}
            />
            <label htmlFor="icon-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Change Logo
              </Button>
            </label>
            <span style={{ marginLeft: "10px" }}>
              {values.image ? values.image.name : ""}
            </span>

            <TextField
              id="name"
              label="Name"
              value={values.name}
              onChange={handleChange("name")}
              margin="normal"
              sx={{ my: 2, width: 400 }}
            />

            <TextField
              id="description"
              label="Description"
              multiline
              rows={3}
              value={values.description}
              onChange={handleChange("description")}
              margin="normal"
              sx={{ my: 2, width: 400 }}
            />

            <Typography
              variant="subtitle1"
              sx={{ mt: 2, color: theme.palette.text.secondary }}
            >
              Owner: {values.owner}
            </Typography>

            {values.error && (
              <Typography component="p" color="error" sx={{ mt: 2 }}>
                <Icon color="error" sx={{ verticalAlign: "middle", mr: 1 }}>
                  error
                </Icon>
                {values.error}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: "center" }}>
            <Button
              color="primary"
              variant="contained"
              onClick={clickSubmit}
              sx={{ mb: 2 }}
            >
              Update
            </Button>
          </CardActions>
        </Card>
          </Grid>
           <Grid item xs={6} sm={6}>
 <MyProducts shopId={params.shopId} />
 </Grid>



    </Grid>
  );

}