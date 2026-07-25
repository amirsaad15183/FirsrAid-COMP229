import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import auth from "../lib/auth-helper";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartIcon from "@mui/icons-material/ShoppingCart";
import cart from "./../cart/cart-helper";
import Badge from "@mui/material/Badge";

const isActive = (location, path) =>
  location.pathname === path ? "#ff4081" : "#ffffff";

const isPartActive = (location, path) => {
 if (location.pathname.includes(path)) return { color: "#bef67a" };
 else return { color: "#ffffff" };
};



export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MERN Skeleton
        </Typography>
        <Link to="/">
          <IconButton aria-label="Home" sx={{ color: isActive(location, "/") }}>
            <HomeIcon />
          </IconButton>
        </Link>
<Link to="/shops/all" style={{ textDecoration: "none" }}>
 <Button sx={{ color: isActive(location, "/shops/") }}>
 
 All Shops
 </Button>
  </Link>

        <Link to="/users">
          <Button sx={{ color: isActive(location, "/users") }}>Users</Button>
        </Link>

                <Link to="/cartItems" style={{ textDecoration: "none" }}>
          <Button
            sx={isActive("/cartItems")}
            color="inherit"
            startIcon={
              <Badge
                color="secondary"
                badgeContent={cart.itemTotal()}
                invisible={cart.itemTotal() === 0}
              >
                <CartIcon />
              </Badge>
            }
          >
            Cart
          </Button>
        </Link>



        {!auth.isAuthenticated() && (
          <>
            <Link to="/signup">
              <Button sx={{ color: isActive(location, "/signup") }}>
                Sign up
              </Button>
            </Link>
            <Link to="/signin">
              <Button sx={{ color: isActive(location, "/signin") }}>
                Sign In
              </Button>
            </Link>
          </>
        )}
  {auth.isAuthenticated() && (
          <>
 {(auth.isAuthenticated()?.user?.seller ||
 auth.isAuthenticated()?.user?.admin) && (

 <Link to="/seller/shops">
 <Button style={isPartActive(location, "/seller/")}>
 My Shops
 </Button>
 </Link>
 )}

            <Link to={`/user/${auth.isAuthenticated().user._id}`}>
              <Button
                sx={{
                  color: isActive(
                    location,
                    `/user/${auth.isAuthenticated().user._id}`
                  ),
                }}
              >
                My Profile
              </Button>
            </Link>
            <Button
              sx={{ color: "#ffffff" }}
              onClick={() => {
                auth.clearJWT(() => navigate("/"));
              }}
            >
              Sign out
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

