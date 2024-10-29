import React, {
  useState,
  useEffect,
  MouseEvent,
  ChangeEvent,
  FormEvent,
} from "react";
import { useAuth } from "../../context/AuthContext";
import {

  Postinterface,
  AuthContextType,
  AnchorEl,
} from "../../Interfaces/postInterface";
import {Axios} from "../../axios";
import "./post.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEdit,
  faTrash,
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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import Carousel from "react-material-ui-carousel";
import Swal from "sweetalert2";

const Post: React.FC = () => {
  const { token, userdata } = useAuth() as AuthContextType;
  const [posts, setPosts] = useState<Postinterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<AnchorEl | null>(null);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState<string>("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const fetchUserPosts = async () => {
    try {
      const response = await Axios.get(
        `/auth/posts/${userdata._id}`);

      const sortedPosts = response.data.sort(
        (a: Postinterface, b: Postinterface) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userdata) {
      fetchUserPosts();
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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewImage(event.target.files![0]);
  };

  const handleSave = async (postId: string) => {
    const formData = new FormData();
    formData.append("desc", newDesc);
    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      await Axios.put(`/auth/editpost/${postId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",}});
      setEditPostId(null);
      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            desc: newDesc,
            img: newImage ? [...post.img!, newImage.name] : post.img,
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      fetchUserPosts();
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
      await Axios.delete(
        `/auth/deletepost/${postIdToDelete}`);
      setDeleteDialogOpen(false);
      setPostIdToDelete(null);
      // toast.success(`Post deleted successfully.`);
    } catch (error) {
      console.error("Error deleting post:", error);
      setPosts(originalPosts);
      // toast.error("Error deleting post.");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [postIdToDelete]: false }));
    }
  };

  const handleLike = async (postId: string) => {
    setLoadingActions((prev) => ({ ...prev, [postId]: true }));
    try {
      await Axios.post(
        `/auth/likepost/${postId}`,
        {});
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(userdata._id)
                  ? post.likes.filter((id) => id !== userdata._id)
                  : [...post.likes, userdata._id],
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
      const response = await Axios.post(
        `/auth/commentpost/${postId}`,
        { text: newComment });

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
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
          await Axios.post(
            `/auth/deleteimage/${postId}`,
            { imageUrl });
          console.log(`postId: ${postId}`);

          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    img: post.img?.filter((img) => img !== imageUrl),
                  }
                : post
            )
          ); // toast.error("Error deleting image.");
          // toast.success("Image deleted successfully.");
        } catch (error) {
          console.error("Error deleting image:", error);
         
        }
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (posts.length === 0) {
    return <div>No posts yet.</div>;
  }

  return (
    <div className="user-posts">
      {posts.map((post) => (
        <div key={post._id} className="post">
          <div className="post-header">
            <Avatar src={userdata.profilePicture} className="post-avatar" />
            <span className="post-author">{userdata.username}</span>
            <IconButton onClick={(e) => handleClick(e, post._id)}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </IconButton>
            <Menu
              anchorEl={anchorEl?.element}
              open={Boolean(anchorEl) && anchorEl?.postId === post._id}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleEdit(post)}>
                <FontAwesomeIcon icon={faEdit} style={{ marginRight: "8px" }} />
                Edit
              </MenuItem>
              <MenuItem onClick={() => handleOpenDeleteDialog(post._id)}>
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ marginRight: "8px" }}
                />
                Delete
              </MenuItem>
            </Menu>
          </div>
          {editPostId === post._id ? (
            <div className="editpost">
              <TextField
                value={newDesc}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewDesc(e.target.value)
                }
              />
              <input type="file" onChange={handleImageChange} />
              <Button onClick={() => handleSave(post._id)}>Save</Button>
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
            <div className="postcontainer">
              <p>{post.desc}</p>
              <div className="postimage">
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
              </div>
            </div>
          )}
          <div className="post-meta">
            <div className="like-container">
              <Button
                className="like-button"
                onClick={() => handleLike(post._id)}
                disabled={loadingActions[post._id]}
              >
                <FontAwesomeIcon
                  icon={faThumbsUp}
                  style={{
                    color: post.likes.includes(userdata._id) ? "blue" : "gray",
                  }}
                />
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
          </div>
          {showComments[post._id] && (
            <div className="comments-section">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="comment">
                  <span className="comment-author">{comment.username} </span>
                  
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              <form
                onSubmit={(e) => handleCommentSubmit(e, post._id)}
                className="comment-form"
              >
                <TextField
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment..."
                  fullWidth
                />
                <Button type="submit">Comment</Button>
              </form>
            </div>
          )}
        </div>
      ))}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={loadingActions[postIdToDelete || ""]}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default Post;
