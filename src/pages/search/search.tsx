import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import { useNavigate } from "react-router-dom";
import{ Axios} from "../../axios";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";

const Search: React.FC = () => {
  const { config } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = () => {
    setLoading(true);
    setShowSuggestions(false);
    Axios.get(`/auth/search/${searchTerm}`)
      .then((res) => {
        console.log(`API response: ${res.data}`);
        setSearchResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`API error: ${err.message}`);
        setLoading(false);
      });
  };

  const handleUserClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        Axios.get(`/auth/search/${searchTerm}`)
          .then((res) => {
            console.log(`API response: ${res.data}`);
            setSearchResults(res.data);
          })
          .catch((err) => {
            console.error(`API error: ${err.message}`);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, config]);

  return (
    <Box className="search">
      <Navbar />
      <Sidebar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f7f7f7",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "10px",
          width: 300,
          position: "fixed",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleChange}
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ marginLeft: 1 }}
        >
          Search
        </Button>
      </Box>
      {loading ? (
        <CircularProgress sx={{ marginTop: 5 }} />
      ) : showSuggestions ? (
        <Box
          sx={{
            position: "fixed",
            top: 150,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            maxHeight: 300,
            overflowY: "auto",
            zIndex: 0,
            width: 300,
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {searchResults.length > 0 ? (
            <List>
              {searchResults.map((user) => (
                <ListItem
                  key={user._id}
                  button
                  onClick={() => handleUserClick(user._id)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.profilePicture} alt={user.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold">
                        {user.username}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            searchTerm.length >= 3 && (
              <Typography textAlign="center" color="gray" fontSize="1.1em">
                No users found
              </Typography>
            )
          )}
        </Box>
      ) : (
        <Box
          sx={{
            position: "absolute",
            top: 160,
            left: 300,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            maxHeight: "calc(100vh - 150px)",
            overflowY: "auto",
            zIndex: 0,
            width: "70%",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <ListItem
                key={user._id}
                button
                onClick={() => handleUserClick(user._id)}
              >
                <ListItemAvatar>
                  <Avatar src={user.profilePicture} alt={user.username} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold">
                      {user.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography textAlign="center" color="gray" fontSize="1.1em">
              No users found
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Search;

