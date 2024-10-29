import React, { useEffect, useState, useContext } from "react";
import {Axios} from "../../axios";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { SocketContext } from "../../context/socket";
import { NotificationInterface } from "../../Interfaces/notificationInterface";



const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await Axios.get("/auth/notifications");
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          setError("Unexpected response data format.");
          setNotifications([]);
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching notifications.");
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket?.on("newLike", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket?.on("newComment", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
  }, [socket]);

  const handleApproveFollow = async (notificationId: string) => {
    try {
      const response = await Axios.post(`/auth/approve-follow/${notificationId}`);
      if (response.data === "User deleted the follow request") {
        alert("Request canceled by the user");
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      } else {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      }
    } catch (error) {
      console.error("Error approving follow request:", error);
    }
  };

  const handleDeclineFollow = async (notificationId: string) => {
    try {
      await Axios.post(`/auth/decline-follow/${notificationId}`);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Grid container sx={{ height: "90vh" }}>
      <Grid item xs={12}>
        <Navbar />
      </Grid>
      <Grid item xs={12} md={2} sx={{ display: { md: "block" } }}>
        {/* Hide the Sidebar on small screens */}
        <Sidebar />
      </Grid>
      <Grid item xs={12} md={10} sx={{ padding: { xs: 2, md: 5 } }}>
        {error && (
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        )}
        {notifications.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: "100%" }}>
            <Typography variant="h5" color="textSecondary">
              No notifications.
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #ddd",
                  padding: { xs: "10px", sm: "15px" }, // Smaller padding for phones
                  flexDirection: { xs: "column", sm: "row" }, // Responsive direction
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Avatar
                  sx={{
                    marginRight: { xs: 0, sm: "15px" },
                    marginBottom: { xs: "10px", sm: 0 }, // Responsive margin
                    backgroundColor: "#007bff",
                    color: "#ffffff",
                    width: { xs: 40, sm: 45 },
                    height: { xs: 40, sm: 45 },
                  }}
                >
                  {notification.content[0]}
                </Avatar>
                <ListItemText
                  primary={notification.content}
                  secondary={
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "0.85em", color: "#6c757d" }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                      {notification.postImage && (
                        <img
                          src={notification.postImage}
                          alt="Post"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginTop: "5px",
                            borderRadius: "5px",
                          }}
                        />
                      )}
                      {notification.type === "follow" && (
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleApproveFollow(notification._id)}
                            sx={{ marginRight: 2, textTransform: "none" }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDeclineFollow(notification._id)}
                            sx={{ textTransform: "none" }}
                          >
                            Decline
                          </Button>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Grid>
    </Grid>
  );
};

export default NotificationPage;
