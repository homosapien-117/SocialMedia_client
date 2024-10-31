
import { AppBar, Toolbar, Typography, Avatar } from "@mui/material"; 
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { userdata } = useAuth();
  return (
    <AppBar position="fixed" sx={{backgroundColor: "#2d3250", zIndex: 2 }}>
      <Toolbar sx={{ justifyContent: "flex-end", height: "60px" }}>
        <div className="profile" style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={userdata?.profilePicture}
            alt="Profile"
            sx={{ height: "40px", width: "40px", marginRight: "10px" }}
          />
          <Typography variant="body1" sx={{ fontSize: "16px", color: "white" }}>
            {userdata?.username}
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
