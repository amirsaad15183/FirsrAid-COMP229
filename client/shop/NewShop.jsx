import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  Typography,
  Icon,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useTheme } from "@mui/material/styles";
import auth from "../lib/auth-helper";
import { create } from "./api-shop.js";
import { Link, Navigate } from "react-router-dom";

export default function NewShop() {
  const theme = useTheme();
  const [values, setValues] = useState({
    name: "",
    description: "",
    image: "",
    redirect: false,
    error: "",
  });
  const jwt = auth.isAuthenticated();

  const handleChange = (name) => (event) => {
    const value = name === "image" ? event.target.files[0] : event.target.value;
    setValues({ ...values, [name]: value });
  };

  const clickSubmit = () => {
    let shopData = new FormData();
    values.name && shopData.append("name", values.name);
    values.description && shopData.append("description", values.description);
    values.image && shopData.append("image", values.image);
    create(
      {
        userId: jwt.user._id,
      },
      {
        t: jwt.token,
      },
      shopData
    ).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({ ...values, error: "", redirect: true });
      }
    });
  };

  if (values.redirect) {
    return <Navigate to={"/seller/shops"} />;
  }

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        textAlign: "center",
        mt: 5,
        pb: 2,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="h2"
          sx={{ mt: 2, color: theme.palette.primary.main }}
        >
          New Shop
        </Typography>

        <br />

        <input
          accept="image/*"
          onChange={handleChange("image")}
          style={{ display: "none" }}
          id="icon-button-file"
          type="file"
        />
        <label htmlFor="icon-button-file">
          <Button
            variant="contained"
            color="secondary"
            component="span"
            startIcon={<AddPhotoAlternateIcon />}
          >
            Upload Logo
          </Button>
        </label>
        <span style={{ marginLeft: "10px" }}>
          {values.image ? values.image.name : ""}
        </span>

        <br />

        <TextField
          id="name"
          label="Name"
          value={values.name}
          onChange={handleChange("name")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />

        <br />

        <TextField
          id="description"
          label="Description"
          multiline
          rows={2}
          value={values.description}
          onChange={handleChange("description")}
          margin="normal"
          sx={{ mx: 1, width: 300 }}
        />

        <br />

        {values.error && (
          <Typography component="p" color="error" sx={{ mt: 1 }}>
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
          sx={{ mb: 2, mx: 1 }}
        >
          Submit
        </Button>

        <Link to="/seller/shops" style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ mb: 2, mx: 1 }}>
            Cancel
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}

