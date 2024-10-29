import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useQueryClient } from "@tanstack/react-query";
import {Axios }from "../../axios";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import EmojiPicker from "emoji-picker-react";
import CloseIcon from "@mui/icons-material/Close";
import { AddPostProps } from "../../Interfaces/postInterface";
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";

const AddPost: React.FC<AddPostProps> = ({ onPostAdded }) => {
  const [desc, setDesc] = useState("");
  const [imgs, setImgs] = useState<Array<string | ArrayBuffer>>([]);
  const [uploading, setUploading] = useState(false);
  const { userdata } = useAuth();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const queryClient = useQueryClient();

  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isExtraSmallScreen = useMediaQuery("(max-width: 380px)");
  const isTabScreen = useMediaQuery("(max-width: 1300px)");

  useEffect(() => {
    if (!userdata) {
      console.log("User not authenticated");
    }
  }, [userdata]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDesc(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      const fileReaders = fileArray.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise<string | ArrayBuffer>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string | ArrayBuffer);
          };
        });
      });

      Promise.all(fileReaders).then((newImgs) => {
        setImgs((prevImgs) => [...prevImgs, ...newImgs]);
        setFiles((prevFiles) => [...prevFiles, ...fileArray]);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImgs((prevImgs) => prevImgs.filter((_, i) => i !== index));
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpload();
    }
  };

  const handleUpload = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (desc?.trim().length !== 0 && desc != null) {
      setUploading(true);
      e?.preventDefault();
      try {
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        const formData = new FormData();
        formData.append("desc", desc);
        files.forEach((file) => {
          formData.append("img", file);
        });
        await Axios.post("/auth/createPost", formData, config);

        queryClient.invalidateQueries({ queryKey: ["posts"] });
        setDesc("");
        setImgs([]);
        setFiles([]);
        onPostAdded();
        setUploading(false);
      } catch (err) {
        console.error(err);
        setUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    handleUpload();
  };

  return (
    <Box 
      sx={{
        boxShadow: 3,
        borderRadius: 2,
        p: 3,
        paddingTop: "10px",
        backgroundColor: "#e9f5ff",
        width: isExtraSmallScreen
        ? "80%"
        : isSmallScreen
        ? "75%"
        : isTabScreen
        ? "100%"
        : "100%",
        maxWidth: "768px",
        margin: "auto",
        marginLeft: isExtraSmallScreen
        ? "10px"
        : isSmallScreen
        ? "30px"
        : isTabScreen
        ? "40px"
        : "50px",
        marginTop: "80px",
        height: "auto", 
        overflow: "hidden", 
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={10}>
          <TextField
            fullWidth
            multiline
            minRows={2.5}
            placeholder={`What's on your mind, ${userdata?.username}?`}
            variant="outlined"
            value={desc}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} container spacing={1} sx={{ flexWrap: "wrap" }}>
          {imgs.map((img, index) => (
            <Grid item key={index}>
              <Box
                sx={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  overflow: "hidden",
                  borderRadius: 2,
                  border: "1px solid #ccc",
                }}
              >
                <IconButton
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    color: "red",
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <CloseIcon />
                </IconButton>
                <img
                  src={img as string}
                  alt="Selected"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid item xs={12} container alignItems="center">
          <Grid item>
            <input
              type="file"
              accept=".png, .jpeg, .jpg"
              id="upload-file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              multiple
            />
            <label htmlFor="upload-file">
              <IconButton color="primary" component="span">
                <AddAPhotoIcon />
              </IconButton>
            </label>
          </Grid>

          <Grid item>
            <IconButton
              color="secondary"
              onClick={() => setEmojiOpen(!emojiOpen)}
            >
              <InsertEmoticonIcon />
            </IconButton>
            {emojiOpen && (
              <Box sx={{ position: "absolute", zIndex: 10 }}>
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setDesc((prev) => (prev ? prev + e.emoji : e.emoji));
                    setEmojiOpen(false);
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs container justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUploadClick}
              disabled={uploading}
              startIcon={uploading && <CircularProgress size={20} />}
              sx={{ whiteSpace: "nowrap" }}
            >
              {uploading ? "Uploading..." : "Post"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddPost;
