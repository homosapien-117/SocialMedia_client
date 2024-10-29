import React, { Dispatch, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../Interfaces/profileInterface";
import "./groupDetails.css";
import {Axios} from "../../axios";

interface GroupDetailsProps {
  groupDetails: any;
  currentUserId: string;
  setShowDetails: Dispatch<React.SetStateAction<boolean>>;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  groupDetails,
  currentUserId,
  setShowDetails,
}) => {
  const [updatedGroupDetails, setUpdatedGroupDetails] = useState(groupDetails);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [addParticipantSearchTerm, setAddParticipantSearchTerm] = useState("");
  const [addParticipantSearchResults, setAddParticipantSearchResults] = useState<User[]>([]);
  console.log(updatedGroupDetails);
  

  if (!updatedGroupDetails) {
    return <div>No group details available</div>;
  }

  const { admin, participants, _id: groupId } = updatedGroupDetails;

  const handleMakeAdmin = async (newAdminId: string) => {
    if (!admin.includes(newAdminId) && admin.includes(currentUserId)) {
      try {
        await Axios.put(`/auth/group/${groupId}/makeAdmin`, { newAdminId });
        setUpdatedGroupDetails((prevDetails: any) => ({
          ...prevDetails,
          admin: [...prevDetails.admin, newAdminId],
        }));
      } catch (error) {
        console.error("Error updating admin:", error);
      }
    }
  };

  const handleRemoveFromGroup = async (participantId: string) => {
    try {
      await Axios.put(`/auth/group/${groupId}/removeParticipant`, {
        participantId,
      });
      setUpdatedGroupDetails((prevDetails: any) => ({
        ...prevDetails,
        participants: prevDetails.participants.filter(
          (p: User) => p._id !== participantId
        ),
        admin: prevDetails.admin.filter((adminId: string) => adminId !== participantId),

      }));
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  const toggleOptions = (participantId: string) => {
    setShowOptions(showOptions === participantId ? null : participantId);
  };

  const handleClose = () => {
    setShowDetails(false);
  };

  const handleOpenAddParticipantModal = () => {
    setShowAddParticipantModal(true);
  };

  const handleAddParticipantSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddParticipantSearchTerm(event.target.value);
  };

  const searchAddParticipants = async () => {
    if (!addParticipantSearchTerm.trim()) {
      setAddParticipantSearchResults([]);
      return;
    }

    try {
      const response = await Axios.get(
        `/auth/searchUsers/${addParticipantSearchTerm}`
      );
      setAddParticipantSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddParticipant = async (newParticipantId: string) => {
    try {
      await Axios.put(`/auth/group/${groupId}/addParticipant`, {
        newParticipantId,
      });

      // Find the newly added participant from search results
      const newParticipant = addParticipantSearchResults.find(
        (p) => p._id === newParticipantId
      );
      if (newParticipant) {
        setUpdatedGroupDetails((prevDetails: any) => ({
          ...prevDetails,
          participants: [...prevDetails.participants, newParticipant],
        }));
      }

      setShowAddParticipantModal(false);
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  return (
    <div className="group-details-container">
      <h2>Group Details</h2>
      <div className="close-btn" onClick={handleClose}></div>
      <p>
        <strong>Participants:</strong> {participants.length}
      </p>

      {admin.includes(currentUserId) && (
        <button
          className="add-participant-btn"
          onClick={handleOpenAddParticipantModal}
        >
          Add Participant
        </button>
      )}

      <ul>
        {participants.map((participant: User) => (
          <li key={participant._id} className="participant-item">
            <div className="participant-details">
              <img
                src={participant.profilePicture}
                alt="#"
                className="participant-avatar"
              />
              <span className="participant-username">
                {participant.username}
              </span>

              {admin.includes(participant._id) && (
                <span className="admin-tag">
                  <FontAwesomeIcon
                    icon={faCrown}
                    style={{ color: "gold", marginRight: "5px" }}
                  />
                </span>
              )}

              <div onClick={() => toggleOptions(participant._id)}>
                <FontAwesomeIcon icon={faEllipsisV} className="options-icon" />
              </div>
            </div>

            {showOptions === participant._id && (
              <div className="participant-options">
                <button
                  onClick={() => handleMakeAdmin(participant._id)}
                  disabled={admin.includes(participant._id)}
                  className="option-button"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => handleRemoveFromGroup(participant._id)}
                  className="option-button"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {showAddParticipantModal && (
        <div className="modal-background">
          <div className="modal-content">
            <h3>Select a participant to add</h3>
            <input
              type="text"
              placeholder="Search for users"
              value={addParticipantSearchTerm}
              onChange={handleAddParticipantSearchTermChange}
              className="search-input"
            />
            <button className="search-btn" onClick={searchAddParticipants}>
              🔍
            </button>
            <ul>
              {addParticipantSearchResults.map((user) => (
                <li key={user._id}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddParticipant(user._id);
                    }}
                  >
                    {user.username} -{" "}
                    {user.profilePicture && (
                      <img src={user.profilePicture} alt="avatar" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="closeBTN"
              onClick={() => setShowAddParticipantModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
