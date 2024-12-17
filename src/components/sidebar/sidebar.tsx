import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBell,
  faSearch,
  faEnvelope,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { List, ListItem, ListItemIcon, ListItemText, useMediaQuery } from "@mui/material";
import { faPersonRifle } from "@fortawesome/free-solid-svg-icons/faPersonRifle";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isSmallScreen = useMediaQuery('(max-width: 650px)');
  const isExtraSmallScreen = useMediaQuery('(max-width: 500px)');

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSearch = () => {
    navigate("/search");
  };

  const handleHome = () => {
    navigate("/home");
  };

  const handleNotification = () => {
    navigate("/notification");
  };

  const handleChat = () => {
    navigate("/chat");
  };



  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        height: "calc(100% - 60px)",
        backgroundColor: "#2d2e5f",
        color: "white",
        paddingTop: "80px",
        zIndex: 2,
        width: isExtraSmallScreen ? '50px' : isSmallScreen ? '100px' : '175px',
      }}
    >
      <List sx={{ padding: 0, paddingLeft: { xs: 1, sm: 2, md: 3 } }}>
        <ListItem button onClick={handleHome}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <FontAwesomeIcon icon={faHome} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Home"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>

        <ListItem button onClick={handleNotification}>
          <ListItemIcon sx={{ minWidth: "28px" }}>
            <FontAwesomeIcon icon={faBell} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Notifications"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>

        <ListItem button onClick={handleSearch}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Search"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>

        <ListItem button onClick={handleChat}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <FontAwesomeIcon icon={faEnvelope} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Messages"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>

        <ListItem button onClick={handleProfileClick}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <FontAwesomeIcon icon={faPersonRifle} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Profile"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>

        <ListItem button onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ color: "white" }} />
          </ListItemIcon>
          {isExtraSmallScreen ? null : (
            <ListItemText
              primary="Logout"
              sx={{
                fontSize: isSmallScreen ? "12px" : "16px",
              }}
            />
          )}
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;