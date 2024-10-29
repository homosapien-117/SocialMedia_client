import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faHome,
  faSignOutAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import "./adminSidebar.css";

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const { Adminlogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Adminlogout();
    navigate("/adminLogin");
  };

  const handleUser = () => {
    navigate("/userlist");
  };

  const handleReport = () => {
    navigate("/reportedposts");
  };
const handleDashboard =()=>{
  navigate("/dashbord")
}
  return (
    <div className="side-container">
      <ul>
        <p onClick={handleDashboard}>
          <li>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
        </p>
        <p onClick={handleUser}>
          <li>
            <FontAwesomeIcon icon={faUsers} /> Users
          </li>
        </p>
        <p onClick={handleReport}>
          <li>
            <FontAwesomeIcon icon={faFlag} /> Reported Post
          </li>
        </p>
        <p onClick={handleLogout}>
          <li>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </li>
        </p>
      </ul>
    </div>
  );
};

export default Sidebar;
