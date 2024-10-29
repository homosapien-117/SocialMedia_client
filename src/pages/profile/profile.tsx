import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Switch,
  Modal,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { faEdit, faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {Axios} from "../../axios";
import EditProfileForm from "../../components/editprofile/editprofile";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Post from "../post/post";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { useAuth } from "../../context/AuthContext";

// import { auto } from "@cloudinary/url-gen/actions/resize";

const ProfilePicture: React.FC = () => {
  const [img, setImg] = useState<string | null>(null);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const { userdata, token, setUserdata } = useAuth();
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 380px)");
  const isTabScreen = useMediaQuery("(max-width: 1300px)");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserdata = JSON.parse(
      localStorage.getItem("user_data") || "{}"
    );
    if (!storedUserdata.user || !storedUserdata.userToken) {
      navigate("/login", { replace: true });
      return;
    }

    setUserdata(storedUserdata.user);
    setIsPrivate(storedUserdata.user.isPrivate);
  }, [location.pathname, navigate, setUserdata]);

  const handleEditClick = () => {
    setShowEditOptions(!showEditOptions);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        setImg(reader.result as string);
        handleUpload(selectedFile);
      };
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("img", selectedFile);

        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const response = await Axios.post(
          "/auth/uploadProfilePicture",
          formData,
          config
        );

        const updatedUser = {
          ...userdata,
          profilePicture: response.data.profilePicture,
        };

        setUserdata(updatedUser);
        localStorage.setItem(
          "user_data",
          JSON.stringify({ userToken: token, user: updatedUser })
        );
        setUploading(false);
      } catch (err) {
        console.error("Upload error:", err);
        setUploading(false);
      }
    }
  };

  const handleSwitchChange = async (newIsPrivate: boolean) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to make your account ${
          newIsPrivate ? "private" : "public"
        }?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
      });

      if (result.isConfirmed) {
        const response = await Axios.patch("/auth/updatestatus", {
          isPrivate: newIsPrivate,
        });
        const updatedUser = response.data;
        setIsPrivate(updatedUser.isPrivate);
        setUserdata(updatedUser);
        localStorage.setItem(
          "user_data",
          JSON.stringify({ userToken: token, user: updatedUser })
        );

        Swal.fire(
          "Updated!",
          `Your account has been ${
            newIsPrivate ? "made private" : "made public"
          }.`,
          "success"
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error!",
        "There was an error updating your privacy status. Please try again later.",
        "error"
      );
    }
  };

  const handleShowFollowers = async () => {
    setShowFollowers(true);
    try {
      const response = await Axios.get(`/auth/getFollowers/${userdata._id}`);
      setFollowers(response.data);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowing(true);
    try {
      const response = await Axios.get(`/auth/getFollowing/${userdata._id}`);
      setFollowing(response.data);
    } catch (err) {
      console.error("Failed to fetch following:", err);
    }
  };

  const handleCloseModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        marginTop: isExtraSmallScreen
          ? -30
          : isSmallScreen
          ? -40
          : isTabScreen
          ? -60
          : -30,
        marginLeft: isExtraSmallScreen
          ? 10
          : isSmallScreen
          ? 10
          : isTabScreen
          ? 40
          : 40,
        maxWidth: isExtraSmallScreen
          ? "100%"
          : isSmallScreen
          ? "100%"
          : isTabScreen
          ? "90%"
          : "1000px",
        overflowX: "auto",
        left: 0,
      }}
    >
      <Box
        sx={{
          width: isExtraSmallScreen
            ? "100%"
            : isSmallScreen
            ? "100%"
            : isTabScreen
            ? "90%"
            : "1000px",
        }}
      >
        <Navbar />
      </Box>

      <Box
        sx={{
          display: "flex",
          position: "relative",
          flexDirection:
            isExtraSmallScreen || isSmallScreen || isTabScreen
              ? "column"
              : "row",
          padding: isExtraSmallScreen
            ? 1
            : isSmallScreen
            ? 1
            : isTabScreen
            ? 2
            : 0,
          marginLeft: isExtraSmallScreen
            ? 0
            : isSmallScreen
            ? 0
            : isTabScreen
            ? 0
            : -20,
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "300px" }}>
          <Sidebar />
        </Box>

        <Box
          sx={{
            position: "relative",
            width: isExtraSmallScreen
              ? "90%"
              : isSmallScreen
              ? "90%"
              : isTabScreen
              ? "80%"
              : "75%",
            padding: isExtraSmallScreen
              ? 0
              : isSmallScreen
              ? 0
              : isTabScreen
              ? 2
              : 5,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: "#fff",
            marginTop: isExtraSmallScreen
              ? 0
              : isSmallScreen
              ? 0
              : isTabScreen
              ? 0
              : 0,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  alt="Profile Picture"
                  src={img || userdata?.profilePicture}
                  sx={{
                    width: isExtraSmallScreen
                      ? 100
                      : isSmallScreen
                      ? 120
                      : isTabScreen
                      ? 150
                      : 150,
                    height: isExtraSmallScreen
                      ? 100
                      : isSmallScreen
                      ? 120
                      : isTabScreen
                      ? 150
                      : 150,
                    border: "4px solid #4a90e2",
                  }}
                />
                {uploading && <Typography>Uploading...</Typography>}
                <Button
                  onClick={handleEditClick}
                  sx={{ mt: 2 }}
                  variant="contained"
                >
                  Edit
                </Button>
                {showEditOptions && (
                  <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
                    <Button
                      variant="outlined"
                      startIcon={<FontAwesomeIcon icon={faCamera} />}
                      component="label"
                    >
                      Change Picture
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FontAwesomeIcon icon={faEdit} />}
                      onClick={() => setIsFormOpen(true)}
                      sx={{ mt: 1 }}
                    >
                      Edit Details
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h4" gutterBottom>
                {userdata?.username}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {userdata?.bio}
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    {(userdata?.followers || []).length}
                  </Typography>
                  <Button onClick={handleShowFollowers}>Followers</Button>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">
                    {(userdata?.following || []).length}
                  </Typography>
                  <Button onClick={handleShowFollowing}>Following</Button>
                </Grid>
                <Grid
                  item
                  xs={10}
                  sx={{ display: "flex", alignItems: "center", ml: 4 }}
                >
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => handleSwitchChange(e.target.checked)}
                  />
                  <Typography>{isPrivate ? "Private" : "Public"}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {isFormOpen && <EditProfileForm closeForm={() => setIsFormOpen(false)} />}

      <Modal open={showFollowers || showFollowing} onClose={handleCloseModal}>
        <Paper sx={{ padding: 3, maxWidth: 400, margin: "auto", mt: 10 }}>
          <Typography variant="h6">
            {showFollowers ? "Followers" : "Following"}
          </Typography>
          <List>
            {(showFollowers ? followers : following).map((user) => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar src={user.profilePicture} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Modal>

      <Box>
        <Post />
      </Box>
    </Box>
  );
};

export default ProfilePicture;
