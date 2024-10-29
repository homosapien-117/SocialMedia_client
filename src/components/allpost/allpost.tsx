import React, {
  useState,
  useEffect,
  MouseEvent,
  ChangeEvent,
  FormEvent,
  useContext,
} from "react";
import { useAuth } from "../../context/AuthContext";
import {Axios} from "../../axios";
import "./allpost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEdit,
  faTrash,
  faFlag,
  faThumbsUp,
  faCommentDots,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import Carousel from "react-material-ui-carousel";
import Swal from "sweetalert2";
import {
  Postinterface,
  AuthContextType,
  AnchorEl,
} from "../../Interfaces/postInterface";
import { SocketContext } from "../../context/socket";

const FollowedPosts: React.FC = () => {
  const { token, userdata } = useAuth() as AuthContextType;
  const [posts, setPosts] = useState<Postinterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [anchorEl, setAnchorEl] = useState<AnchorEl | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
  const [postIdToReport, setPostIdToReport] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      try {
        const response = await Axios.get(
          `/auth/getTimelinePost/${userdata._id}`
        );

        const sortedPosts = response.data.sort(
          (a: Postinterface, b: Postinterface) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sortedPosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching followed posts:", error);
        setLoading(false);
      }
    };

    if (userdata) {
      fetchFollowedPosts();
    }
  }, [userdata, token]);

  const cld = new Cloudinary({
    cloud: {
      cloudName: "dt6kmfqpn",
    },
  });

  const publicId = (imageUrl: string) => {
    return imageUrl.split("/").pop()?.split(".")[0] || "";
  };

  const handleEdit = (post: Postinterface) => {
    setEditPostId(post._id);
    setNewDesc(post.desc);
    setAnchorEl(null);
  };

  const handleSave = async (postId: string) => {
    const formData = new FormData();
    formData.append("desc", newDesc);
    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      const response = await Axios.put(`/auth/editpost/${postId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedPost: Postinterface = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...updatedPost,
              authorName: userdata.username,
              authorProfilePicture: userdata.profilePicture,
            };
          }
          return post;
        })
      );

      setEditPostId(null);
      setNewImage(null);
      setNewDesc("");
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleDelete = async () => {
    if (!postIdToDelete) return;
    setLoadingActions((prev) => ({ ...prev, [postIdToDelete]: true }));
    const originalPosts = [...posts];
    setPosts(posts.filter((post) => post._id !== postIdToDelete));
    try {
      await Axios.delete(`/auth/deletepost/${postIdToDelete}`);
      setDeleteDialogOpen(false);
      setPostIdToDelete(null);
      toast.success("Post deleted successfully.");
    } catch (error) {
      console.error("Error deleting post:", error);
      setPosts(originalPosts);
      toast.error("Error deleting post.");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postIdToDelete]: false }));
    }
  };

  const handleLike = async (postId: string) => {
    setLoadingActions((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await Axios.post(`/auth/likepost/${postId}`, {});
      console.log(response);
      socket?.emit("liked post", response.data.notification);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: Array.isArray(post.likes)
                  ? post.likes.includes(userdata._id)
                    ? post.likes.filter((id) => id !== userdata._id)
                    : [...post.likes, userdata._id]
                  : [],
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

  const openReportDialog = (postId: string) => {
    setPostIdToReport(postId);
    setReportDialogOpen(true);
    setAnchorEl(null);
  };

  const closeReportDialog = () => {
    setReportDialogOpen(false);
    setPostIdToReport(null);
    setReportReason("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewImage(event.target.files![0]);
  };

  const handleDeleteImage = async (imageUrl: string, postId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Axios.post(`/auth/deleteimage/${postId}`, { imageUrl });
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    img: post.img?.filter((img) => img !== imageUrl),
                  }
                : post
            )
          );
          toast.success("Image deleted successfully.");
        } catch (error) {
          console.error("Error deleting image:", error);
          toast.error("Error deleting image.");
        }
      }
    });
  };
  const submitReport = async () => {
    if (!postIdToReport) return;

    try {
      await Axios.post(`/auth/reportpost/${postIdToReport}`, {
        reason: reportReason,
      });
      toast.success("Post reported successfully.");
      closeReportDialog();
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Error reporting post.");
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
      socket?.emit("comment",response.data.notification)
      const addedComment = response.data.post;
      console.log(addedComment);

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
                    username: userdata.username,
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
      toast.error("Error adding comment.");
    }
  };

  const handleClick = (event: MouseEvent<HTMLElement>, postId: string) => {
    setAnchorEl({ element: event.currentTarget, postId, username:"" });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = (postId: string) => {
    setPostIdToDelete(postId);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostIdToDelete(null);
  };

  const toggleCommentsVisibility = (postId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  if (loading) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className="no-posts">No posts yet.</div>;
  }

  return (
    <div className="followed-posts">
      {posts.map((post) => (
        <div key={post._id} className="follower-post">
          <div className="post-header">
            <Avatar
              alt={post.authorName}
              src={post.authorProfilePicture}
              className="post-avatar"
            />
            <span className="post-author">{post.authorName}</span>
            <IconButton onClick={(e) => handleClick(e, post._id)}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </IconButton>

            <Menu
              anchorEl={anchorEl?.element}
              open={Boolean(anchorEl) && anchorEl?.postId === post._id}
              onClose={handleClose}
            >
              {post.userId === userdata._id ? (
                <div>
                  <MenuItem onClick={() => handleEdit(post)}>
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{ marginRight: "8px" }}
                    />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={() => handleOpenDeleteDialog(post._id)}>
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ marginRight: "8px" }}
                    />
                    Delete
                  </MenuItem>
                </div>
              ) : (
                <MenuItem onClick={() => openReportDialog(post._id)}>
                  <FontAwesomeIcon
                    icon={faFlag}
                    style={{ marginRight: "8px" }}
                  />
                  Report
                </MenuItem>
              )}
            </Menu>
          </div>

          {editPostId === post._id ? (
            <div>
              <TextField
                value={newDesc}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewDesc(e.target.value)
                }
                fullWidth
              />
              <input type="file" onChange={handleImageChange} />
              <Button
                onClick={() => handleSave(post._id)}
                // disabled={loadingActions[post._id]}
              >
                Save
              </Button>
              {post.img && post.img.length > 0 && (
                <div>
                  <h4>Current Images:</h4>
                  {post.img.map((imageUrl, index) => (
                    <div key={index} className="current-image">
                      <AdvancedImage
                        cldImg={cld.image(publicId(imageUrl))}
                        alt="Post image"
                        className="carousel-image"
                      />
                      <IconButton
                        onClick={() => handleDeleteImage(imageUrl, post._id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="post-header-content">
                <p className="post-desc">{post.desc}</p>
              </div>
              {post.img && post.img.length > 0 && (
                <Carousel className="carousel-container">
                  {post.img.map((imageUrl, index) => (
                    <Paper key={index} className="carousel-item">
                      <AdvancedImage
                        cldImg={cld.image(publicId(imageUrl))}
                        alt="Post image"
                        className="carousel-image"
                      />
                    </Paper>
                  ))}
                </Carousel>
              )}
            </>
          )}

          <div className="like-container">
            <Button
              className="like-button"
              onClick={() => handleLike(post._id)}
              disabled={loadingActions[post._id]}
              style={{
                color:
                  Array.isArray(post.likes) && post.likes.includes(userdata._id)
                    ? "blue"
                    : "black",
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} />
              <span className="like-count">{post.likes.length}</span>
            </Button>
            <IconButton
              className="comment-button"
              onClick={() => toggleCommentsVisibility(post._id)}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              <span className="comment-count">
                {post.comments ? post.comments.length : 0}
              </span>
            </IconButton>
          </div>

          {showComments[post._id] && (
            <>
              <form
                onSubmit={(e) => {
                  handleCommentSubmit(e, post._id);
                  setCommentingPostId(post._id);
                }}
                className="comment-form"
              >
                <TextField
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment..."
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
                <Button
                  type="submit"
                  color="primary"
                  disabled={loadingActions[commentingPostId || ""]}
                >
                  Comment
                </Button>
              </form>
              <div className="comments-list">
                {post.comments && post.comments.length > 0 && (
                  <>
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="comment">
                        <strong>{comment.username}:</strong> {comment.text}
                        {/* <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span> */}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="secondary"
            disabled={!postIdToDelete || loadingActions[postIdToDelete]}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reportDialogOpen}
        onClose={closeReportDialog}
        aria-labelledby="report-dialog-title"
      >
        <DialogTitle id="report-dialog-title">Report Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select a reason for reporting this post:
          </DialogContentText>
          <TextField
            select
            label="Reason"
            value={reportReason}
            onChange={(e: ChangeEvent<{ value: unknown }>) =>
              setReportReason(e.target.value as string)
            }
            fullWidth
            SelectProps={{
              native: true,
            }}
            margin="dense"
          >
            <option value="">Select a reason</option>
            <option value="spam">Spam</option>
            <option value="abuse">Abusive content</option>
            <option value="misinformation">Misinformation</option>
            <option value="other">Other</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReportDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={submitReport}
            color="secondary"
            disabled={!reportReason || loadingActions[postIdToReport || ""]}
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default FollowedPosts;
