import React, { useState, useEffect, useContext } from "react";
import "./chat.css";
import { Axios } from "../../axios";
import EmojiPicker from "emoji-picker-react";
import Navbar from "../../components/navbar/navbar";
import Sidebar from "../../components/sidebar/sidebar";
import GroupDetails from "../../components/groupDetails/groupDetails";
import { SocketContext } from "../../context/socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faUsers,
  faSmile,
  faEllipsisV,
  faPaperclip,
  faPhone,
  faFile,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import ZIM from "zego-zim-web";

// get token
function generateToken(tokenServerUrl: string, userID: string) {
  return fetch(
    `${tokenServerUrl}/access_token?userID=${userID}&expired_ts=70200`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
}

export function getUrlParams(
  url: string = window.location.href
): URLSearchParams {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

const Chat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [emoji, setEmoji] = useState<{ emoji: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupCreated, setGroupCreated] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<any[]>([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showDetailsDropdown, setShowDetailsDropdown] = useState(false);
  const [showLeaveGroupDropdown, setShowLeaveGroupDropdown] = useState(false);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const { userdata } = useAuth();
  const currentUserId = userdata?._id;
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (selectedChat && chatId) {
      const receiveMessageHandler = (message: any) => {
        if (message.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, message]);
          handleUserClick(selectedChat);
        } else {
          fetchChatUsers();
        }
      };
      socket?.on("receiveMessage", receiveMessageHandler);
      return () => {
        socket?.off("receiveMessage", receiveMessageHandler);
      };
    } else {
      socket?.on("receiveMessage", fetchChatUsers);
    }
  }, [selectedChat, chatId, socket]);

  useEffect(() => {
    const receiveMessageHandler = () => {
      fetchChatUsers();
    };

    socket?.on("receiveMessage", receiveMessageHandler);

    return () => {
      socket?.off("receiveMessage", receiveMessageHandler);
    };
  }, [socket]);

  useEffect(() => {
    fetchChatUsers();
  }, [groupCreated]);

  useEffect(() => {
    socket?.on("receivetyping", () => {
      setTypingMessage(`is typing...`);
      console.log(` is typing...`);
    });

    socket?.on("receiveStopTyping", () => {
      setTypingMessage("");
      console.log(` stopped typing.`);
    });

    return () => {
      socket?.off("recivetyping");
      socket?.off("reciveStopTyping");
    };
  }, [socket]);

  const fetchChatUsers = async () => {
    try {
      const response = await Axios.get("/auth/getUserChats");
      const sortedChats = response.data.sort((a: any, b: any) => {
        const timeA = new Date(a.lastMessage?.timeStamp || 0).getTime();
        const timeB = new Date(b.lastMessage?.timeStamp || 0).getTime();
        return timeB - timeA;
      });
      setChatUsers(sortedChats);
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
  };

  const searchUsers = async () => {
    setSearchResults([]);

    try {
      const response = await Axios.get(`/auth/searchChat/${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const searchGroupParticipants = async () => {
    setGroupSearchResults([]);

    try {
      const response = await Axios.get(`/auth/searchChat/${groupSearchTerm}`);
      setGroupSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users for group:", error);
    }
  };

  const handleUserClick = async (chat: any) => {
    try {
      const response = await Axios.post("/auth/createOrGetChat", {
        selectedUserId: chat._id,
      });
      const chatData = response.data;
      setChatId(chatData._id);
      socket?.emit("JoinRoom", chatData._id);
      const messagesResponse = await Axios.get(
        `/auth/chat/${chatData._id}/messages`
      );
      setMessages(messagesResponse.data);
      setSelectedChat(chatData.isGroupChat ? chatData : chat);
    } catch (error) {
      console.error("Error creating or fetching chat:", error);
    }
  };

  const handleTyping = (e: any) => {
    setNewMessage(e.target.value);
    if (isTyping == false) {
      setIsTyping(true);
      socket?.emit("typing", chatId);
    }
    if (isTyping == true) {
      setTimeout(() => {
        setIsTyping(false);
        socket?.emit("stopTyping", chatId);
      }, 2000);
    }
  };

  const handleSend = () => {
    handleSendMessage();
    setNewMessage("");
    setIsTyping(false);
    socket?.emit("stopTyping", chatId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && !imageFile && !documentFile) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("content", newMessage);
    formData.append(
      "senderId",
      JSON.parse(localStorage.getItem("user_data") ?? "")?.user?._id
    );

    formData.append("senderName", userdata?.username);

    if (emoji) {
      formData.append("emoji", emoji.emoji);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (documentFile) {
      formData.append("document", documentFile);
    }

    try {
      console.log("Sending message:", [...formData.entries()]);
      const response = await Axios.post("/auth/sendMessage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const message = response.data;
      socket?.emit("sendMessage", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      handleUserClick(selectedChat);
      fetchChatUsers();
      setNewMessage("");
      setImageFile(null);
      setDocumentFile(null);
      setEmoji(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() === "" || groupParticipants.length === 0) return;

    try {
      const response = await Axios.post("/auth/createGroupChat", {
        groupName,
        participants: groupParticipants.map((user) => user._id),
      });

      const groupChat = response.data;
      setChatId(groupChat._id);
      setSelectedChat(groupChat);
      socket?.emit("JoinRoom", groupChat._id);

      const messagesResponse = await Axios.get(
        `/auth/chat/${groupChat._id}/messages`
      );
      setMessages(messagesResponse.data);
      setGroupName("");
      setGroupParticipants([]);
      setIsCreatingGroup(false);

      setGroupCreated((prev) => !prev);
    } catch (error) {
      console.error("Error creating group chat:", error);
    }
  };

  const addParticipant = (user: any) => {
    if (
      !groupParticipants.some((participant) => participant._id === user._id)
    ) {
      setGroupParticipants([...groupParticipants, user]);
    }
  };

  const getChatName = () => {
    if (selectedChat?.groupName) {
      return selectedChat.groupName || "Unnamed Group";
    } else if (selectedChat) {
      return selectedChat.username;
    } else {
      return "Select a chat";
    }
  };

  const handleEmojiClick = (emoji: { emoji: string }) => {
    setNewMessage(newMessage + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleMoreOptionsClick = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);
  const fetchGroupDetails = async () => {
    if (!selectedChat?._id) return;

    try {
      const response = await Axios.get(
        `/auth/group/${selectedChat._id}/details`
      );
      if (response.status === 200) {
        setGroupDetails(response.data);
        console.log(response);
        console.log(groupDetails);
      } else {
        console.error("Error fetching group details:", response.status);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const handleDetailsClick = () => {
    if (showDetailsDropdown == false) {
      setShowDetailsDropdown(true);
      fetchGroupDetails();
    } else {
      setShowDetailsDropdown(false);
    }
  };

  const handleLeaveGroupClick = () => {
    if (selectedChat) {
      Swal.fire({
        title: "Are you sure you want to leave this group?",
        text: "You will no longer be able to see messages or participate in this group.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, leave",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          handleLeaveGroup();
          setShowDetailsDropdown(false);
          setShowDetailsDropdown(false);
          setShowLeaveGroupDropdown(false);
        }
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedChat?._id) return;

    try {
      const response = await Axios.delete(
        `/auth/group/${selectedChat._id}/leave`
      );

      if (response.status === 200) {
        const updatedChatUsers = chatUsers.filter(
          (user) => user._id !== selectedChat._id
        );
        setChatUsers(updatedChatUsers);
        setSelectedChat(null);
      } else {
        console.error("Error leaving group:", response.status);
      }
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };
  let zp: ZegoUIKitPrebuilt;

  let myMeeting = async () => {
    const userID = currentUserId;

    const userName = userdata?.username;

    await generateToken("https://nextjs-token.vercel.app/api", userID).then(
      (res) => {
        const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          1484647939,
          res.token,
          chatId,
          userID,
          userName
        );
        zp = ZegoUIKitPrebuilt.create(token);
        zp.addPlugins({ ZIM });
      }
    );
  };

  const invite = () => {
    const targetUser = {
      userID: selectedChat._id,
      userName: "",
    };
    zp.sendCallInvitation({
      callees: [targetUser],
      callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
      timeout: 60,
      roomID: chatId,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="chat-app-container">
      <Navbar />
      <Sidebar />
      <div className="chat-sidebar">
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" onClick={searchUsers}>
            🔍
          </button>
        </div>
        <div>
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user._id} onClick={() => handleUserClick(user)}>
                <span>{user.username}</span>
              </div>
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
        <button
          className="create-group-btn"
          onClick={() => setIsCreatingGroup(true)}
        >
          <FontAwesomeIcon icon={faUsers} /> Create Group
        </button>
        <div className="chat-list">
          {chatUsers.map((chat) => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => handleUserClick(chat)}
            >
              <img
                src={
                  chat.isGroupChat
                    ? "https://via.placeholder.com/50"
                    : chat.profilePicture || "https://via.placeholder.com/50"
                }
                alt={chat.groupName || chat.username}
                className="chat-avatar"
              />
              <div className="chat-item-info">
                <div className="chat-item-header">
                  <span className="chat-item-name">
                    {chat.groupName || chat.username}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-header">
          <h2>{getChatName()}</h2>
          {typingMessage && (
            <div className="typing-indicator">{typingMessage}</div>
          )}
          <FontAwesomeIcon
            icon={faPhone}
            className="call-icon"
            onClick={invite}
          />

          {selectedChat?.groupName && (
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="more-options-icon"
              onClick={handleMoreOptionsClick}
            />
          )}

          {showMoreOptions && (
            <div className="more-options-menu">
              <div className="dropdown">
                <button
                  className="dropdown-button"
                  onClick={handleDetailsClick}
                >
                  Details
                </button>
                {showDetailsDropdown && groupDetails && (
                  <div className="dropdown-content">
                    <GroupDetails
                      setShowDetails={setShowDetailsDropdown}
                      groupDetails={groupDetails}
                      currentUserId={currentUserId}
                    />
                  </div>
                )}
              </div>
              <div className="dropdown" onClick={handleLeaveGroupClick}>
                <button className="dropdown-button">Leave Group</button>
                {showLeaveGroupDropdown && (
                  <div className="dropdown-content"></div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-item ${
                msg.senderId ===
                JSON.parse(localStorage.getItem("user_data") ?? "")?.user?._id
                  ? "outgoing"
                  : "incoming"
              }`}
            >
              {selectedChat?.groupName && (
                <span className="message-sender">{msg.senderName}</span>
              )}

              <div className="message-bubble">
                {msg.content && <p>{msg.content}</p>}
                {msg.imageUrl &&
                  !Array.isArray(msg.imageUrl) &&
                  /\.(jpeg|jpg|png|gif)$/i.test(msg.imageUrl) && (
                    <img src={msg.imageUrl} alt="" className="message-image" />
                  )}
                {msg.documentUrl &&
                  /\.(pdf|docx?|pptx?)$/i.test(msg.documentUrl) && (
                    <a
                      href={msg.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "black",
                        textDecoration: "none",
                        fontWeight: "bold",
                        margin: "2px 0",
                        fontSize: "10px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faFile}
                        style={{ fontSize: "34px", marginRight: "20px" }}
                      />
                      View Document
                    </a>
                  )}
                {Array.isArray(msg.imageUrl)
                  ? msg.imageUrl.map((image: string, idx: number) => (
                      <a
                        key={idx}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/\.(jpeg|jpg|png|gif)$/i.test(image) && (
                          <img src={image} alt="" className="message-image" />
                        )}
                      </a>
                    ))
                  : msg.imageUrl &&
                    /\.(jpeg|jpg|png|gif)$/i.test(msg.imageUrl) && (
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={msg.imageUrl}
                          alt=""
                          className="message-image"
                        />
                      </a>
                    )}
              </div>
              {msg.senderId ===
                JSON.parse(localStorage.getItem("user_data") ?? "")?.user
                  ?._id &&
                msg.ReadStatus && (
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    style={{
                      color: "#007bff",
                      fontSize: "11px",
                      marginLeft: "5px",
                    }}
                  />
                )}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Your message"
            value={newMessage}
            onChange={handleTyping}
          />
          <button
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FontAwesomeIcon icon={faSmile} />
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <label htmlFor="image-upload" className="image-upload-icon">
            <FontAwesomeIcon icon={faPaperclip} />
          </label>
          <input
            type="file"
            id="image-upload"
            style={{ display: "none" }}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;

              if (file) {
                const isImage = file.type.startsWith("image/");
                const isDocument = [
                  "application/pdf",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ].includes(file.type);

                if (isImage) {
                  console.log("Selected file is an image.");
                  setImageFile(file);
                } else if (isDocument) {
                  console.log("Selected file is a document.");
                  setDocumentFile(file);
                } else {
                  console.log("Unsupported file type.");
                  alert("Please select a valid image or document file.");
                }
              }
            }}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={isSending}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>

      {isCreatingGroup && (
        <div className="group-creation-modal">
          <div className="group-creation-content">
            <h2>Create Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search for participants"
              value={groupSearchTerm}
              onChange={(e) => setGroupSearchTerm(e.target.value)}
            />
            <button className="search-btn" onClick={searchGroupParticipants}>
              🔍
            </button>
            <div className="search-results">
              {groupSearchResults.map((user) => (
                <div
                  key={user._id}
                  className="search-result-item"
                  onClick={() => addParticipant(user)}
                >
                  <img
                    src={
                      user.profilePicture || "https://via.placeholder.com/50"
                    }
                    alt={user.username}
                    className="search-result-avatar"
                  />
                  <div className="search-result-info">
                    <span className="search-result-name">{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="group-participants">
              {groupParticipants.map((user) => (
                <div key={user._id} className="participant-item">
                  <img
                    src={
                      user.profilePicture || "https://via.placeholder.com/50"
                    }
                    alt={user.username}
                    className="participant-avatar"
                  />
                  <span className="participant-name">{user.username}</span>
                </div>
              ))}
            </div>
            <div className="group-creation-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsCreatingGroup(false)}
              >
                Cancel
              </button>
              <button className="create-btn" onClick={handleCreateGroup}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {isOpenCallModal && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></div>
      )} */}

      <div
        className="myCallContainer"
        ref={myMeeting}
        style={{ height: "100%", position: "absolute", zIndex: 1000 }}
      ></div>
    </div>
  );
};

export default Chat;
