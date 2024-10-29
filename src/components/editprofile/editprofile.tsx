import React, { ChangeEvent, useState } from "react";
import {Axios }from "../../axios";
import { useAuth } from "../../context/AuthContext";
import { EditProfileFormProps } from "../../Interfaces/profileInterface";
import { Box, Button, TextField, Typography } from "@mui/material";

const EditProfileForm: React.FC<EditProfileFormProps> = ({ closeForm }) => {
  const { userdata, token, setUserdata } = useAuth();
  const [editData, setEditData] = useState({
    name: userdata.username,
    bio: userdata.bio,
  });
  
  const [errors, setErrors] = useState({
    name: "",
    bio: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    

    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", bio: "" };


    if (!editData.name.trim()) {
      newErrors.name = "Name is required.";
      valid = false;
    } else if (editData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
      valid = false;
    }

    if (editData.bio.length > 150) {
      newErrors.bio = "Bio cannot exceed 150 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      const response = await Axios.put("/auth/updateProfileDetails", {
        name: editData.name,
        bio: editData.bio,
      });

      const updatedUser = { ...userdata, ...response.data };
      setUserdata(updatedUser);
      localStorage.setItem(
        "user_data",
        JSON.stringify({ userToken: token, user: updatedUser })
      );
      closeForm();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: 3,
        boxShadow: 4,
        borderRadius: 2,
        zIndex: 1000,
        width: 400,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Edit Profile
      </Typography>
      <form>
        <TextField
          label="Name"
          name="name"
          value={editData.name}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.name} 
          helperText={errors.name} 
        />
        <TextField
          label="Bio"
          name="bio"
          value={editData.bio}
          onChange={handleInputChange}
          variant="outlined"
          fullWidth
          margin="normal"
          error={!!errors.bio} 
          helperText={errors.bio} 
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          fullWidth
          sx={{ marginBottom: 1 }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={closeForm}
          fullWidth
        >
          Cancel
        </Button>
      </form>
    </Box>
  );
};

export default EditProfileForm;
