import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { faThumbsUp, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconButton,
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Modal,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Divider,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {Axios} from "../../axios";
import { AxiosResponse } from "axios";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import Swal from "sweetalert2";
import { User } from "../../Interfaces/profileInterface";
import { Postinterface } from "../../Interfaces/postInterface";
import Carousel from "react-material-ui-carousel";

const UserProfile: React.FC = () => {
  // const { config } = useAuth();
  const currentUserdata = JSON.parse(localStorage.getItem("user_data") || "{}");
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Postinterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRequestPending, SetIsRequestPending] = useState(false);
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 380px)");
  const isTabScreen = useMediaQuery("(max-width: 1300px)");

  useEffect(() => {
    Axios.get(`/auth/users/${userId}`)
      .then((res: AxiosResponse<{ user: User; posts: Postinterface[] }>) => {
        const { user, posts } = res.data;
        setUser(user);
        setPosts(posts);

        setLoading(false);

        if (user.blockedMe.includes(currentUserdata.user._id)) {
          setIsBlocked(true);
        }
        if (user.requests.includes(currentUserdata.user._id)) {
          SetIsRequestPending(true);
        } else {
          SetIsRequestPending(false);
        }
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
        setLoading(false);
      });
  }, [userId, currentUserdata.user._id]);

  const handleFollow = async () => {
    if (user) {
      const isFollowing = user.followers.includes(currentUserdata.user._id);
      try {
        if (isFollowing) {
          await Axios.put(`/auth/unfollow/${userId}`);
          setUser({
            ...user,
            followers: user.followers.filter(
              (id) => id !== currentUserdata.user._id
            ),
          });
        } else if (isRequestPending) {
          await Axios.put(`/auth/cancelRequest/${userId}`);
          SetIsRequestPending(false);
          Swal.fire(
            "Request canceled.",
            "Your follow request has been canceled.",
            "info"
          );
        } else if (user.isPrivate) {
          await Axios.put(`/auth/follow/${userId}`);
          SetIsRequestPending(true);
          Swal.fire("Follow request sent.", "info");
        } else {
          await Axios.put(`/auth/follow/${userId}`);
          setUser({
            ...user,
            followers: [...user.followers, currentUserdata.user._id],
          });
        }
      } catch (err: any) {
        console.error(`API error: ${err.message}`);
      }
    }
  };

  const handleShowFollowers = async () => {
    setShowFollowers(true);
    try {
      const response = await Axios.get(`/auth/getFollowers/${userId}`);
      setFollowers(response.data);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowing = async () => {
    setShowFollowing(true);
    try {
      const response = await Axios.get(`/auth/getFollowing/${userId}`);
      setFollowing(response.data);
    } catch (err) {
      console.error("Failed to fetch following:", err);
    }
  };

  const handleCloseModal = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  const handleBlock = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to block this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, block",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.put(`/auth/blockuser/${userId}`);
          setIsBlocked(true);
          Swal.fire("Blocked!", "The user has been blocked.", "success");
        } catch (err: any) {
          console.error(`API error: ${err.message}`);
          Swal.fire("Error!", "Failed to block the user.", "error");
        }
      }
    });
  };

  const handleUnblock = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to unblock this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, unblock",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.put(`/auth/unblockuser/${userId}`);
          setIsBlocked(false);
          Swal.fire("Unblocked!", "The user has been unblocked.", "success");
        } catch (err: any) {
          console.error(`API error: ${err.message}`);
          Swal.fire("Error!", "Failed to unblock the user.", "error");
        }
      }
    });
  };

  const handleLike = async (postId: string) => {
    setLoadingActions((prev) => ({ ...prev, [postId]: true }));
    try {
      await Axios.post(`/auth/likepost/${postId}`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(currentUserdata.user._id)
                  ? post.likes.filter((id) => id !== currentUserdata.user._id)
                  : [...post.likes, currentUserdata.user._id],
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = async (event: FormEvent, postId: string) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await Axios.post(`/auth/commentpost/${postId}`, {
        text: newComment,
      });
      const addedComment = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  {
                    _id: addedComment._id,
                    text: newComment,
                    username: currentUserdata.user.username,
                    createdAt: addedComment.createdAt,
                  },
                ],
              }
            : post
        )
      );
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentsVisibility = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <Navbar />
      <Sidebar />
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          marginTop: -40,
          position: "absolute",
          left:0
        }}
      >
        <Grid
          item
          sx={{
            maxWidth: isExtraSmallScreen
              ? "70%"
              : isSmallScreen
              ? "80%"
              : isTabScreen
              ? "100%"
              : "500px",
            position: "relative",
            marginLeft: isExtraSmallScreen
              ? 10
              : isSmallScreen
              ? 9
              : isTabScreen
              ? 20
              : 75,
            marginTop: isExtraSmallScreen
              ? 10
              : isSmallScreen
              ? -5
              : isTabScreen
              ? -20
              : 0,
          }}
        >
          <Paper elevation={3} style={{ padding: "40px" }}>
            <img
              src={user?.profilePicture}
              alt={user?.username}
              style={{ width: "40%", borderRadius: "50%" }}
            />
            <Typography variant="h5">{user?.username}</Typography>
            <Typography variant="body1">{user?.bio}</Typography>
            <div
              className="udetails"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <Typography
                variant="body2"
                onClick={handleShowFollowers}
                style={{ cursor: "pointer" }}
              >
                {user?.followers.length} FOLLOWERS
              </Typography>
              <Typography
                variant="body2"
                onClick={handleShowFollowing}
                style={{ cursor: "pointer" }}
              >
                {user?.following.length} FOLLOWING
              </Typography>
            </div>
            <div className="userdetails" style={{ padding: 10 }}>
              <Button
                variant="contained"
                onClick={handleFollow}
                style={{ margin: 20 }}
              >
                {user?.followers.includes(currentUserdata.user._id)
                  ? "UNFOLLOW"
                  : isRequestPending
                  ? "REQUESTED"
                  : "FOLLOW"}
              </Button>
              <Button
                variant="outlined"
                onClick={isBlocked ? handleUnblock : handleBlock}
                style={{ margin: 20 }}
              >
                {isBlocked ? "UNBLOCK" : "BLOCK"}
              </Button>
            </div>
            {user?.isPrivate &&
              !user.followers.includes(currentUserdata.user._id) &&
              !user.following.includes(currentUserdata.user._id) && (
                <Typography variant="caption" color="textSecondary">
                  The account is private
                </Typography>
              )}
          </Paper>
        </Grid>

        <Grid
          item
          xs={14}
          sm={5}
          sx={{
            marginLeft: isExtraSmallScreen
              ? 7
              : isSmallScreen
              ? 6
              : isTabScreen
              ? 40
              : 65,
            padding: 0,
            marginTop: isExtraSmallScreen
              ? 5
              : isSmallScreen
              ? 3
              : isTabScreen
              ? 15
              : 0,
          }}
        >
          {posts.length > 0 && (
            <div className="userposts" style={{ margin: 10 }}>
              {posts.map((post) => (
                <Paper key={post._id} elevation={2} style={{ padding: "10px" }}>
                  <Typography variant="body1">{post.desc}</Typography>
                  <Carousel>
                    {post.img?.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        style={{ width: "100%", borderRadius: 0 }}
                      />
                    ))}
                  </Carousel>
                  <div className="post-actions">
                    <IconButton
                      onClick={() => handleLike(post._id)}
                      disabled={loadingActions[post._id]}
                    >
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        style={{
                          color: post.likes.includes(currentUserdata.user._id)
                            ? "blue"
                            : "gray",
                        }}
                      />
                      <span>{post.likes.length}</span>
                    </IconButton>
                    <IconButton
                      onClick={() => toggleCommentsVisibility(post._id)}
                    >
                      <FontAwesomeIcon icon={faCommentDots} />
                      <span>{post.comments?.length}</span>
                    </IconButton>
                  </div>

                  {showComments[post._id] && (
                    <div className="comments-section">
                      <form onSubmit={(e) => handleCommentSubmit(e, post._id)}>
                        <TextField
                          value={newComment}
                          onChange={handleCommentChange}
                          placeholder="Add a comment..."
                          fullWidth
                        />
                        <Button type="submit">Post</Button>
                      </form>
                      <List>
                        {post.comments?.map((comment) => (
                          <ListItem key={comment._id}>
                            <ListItemAvatar>
                              <Avatar>{comment.username.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={comment.username}
                              secondary={comment.text}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  )}
                </Paper>
              ))}
            </div>
          )}
        </Grid>
      </Grid>

      <Modal open={showFollowers || showFollowing} onClose={handleCloseModal}>
        <Paper
          style={{ padding: "20px", margin: "100px auto", width: "400px" }}
        >
          <Typography variant="h6">
            {showFollowers ? "Followers" : "Following"}
          </Typography>
          <Divider />
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
    </Container>
  );
};
export default UserProfile;
