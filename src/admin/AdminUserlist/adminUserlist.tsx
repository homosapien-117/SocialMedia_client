import React, { useState, useEffect } from "react";
import Sidebar from "../../components/adminsidebar/adminSidebar";
import "./adminUserlist.css";
import { AdminAxios } from "../../axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { User } from "../../Interfaces/profileInterface";

const UserTable: React.FC = () => {
  const { admintoken } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchtext, setSearchtext] = useState<string>("");
  const [userlist, setUserlist] = useState<User[]>([]);
  const [showsort, setShowsort] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await AdminAxios.get(
        `/auth/userlist?page=${currentPage}&limit=${usersPerPage}`
      );
      setUsers(response.data.users);
      setUserlist(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await AdminAxios.get(
        `/auth/search/${searchtext}?page=${currentPage}&limit=${usersPerPage}`
        
      );
      console.log("Search results:", response.data);
      setUserlist(response.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentPage, admintoken]);
  useEffect(() => {
    if (searchtext.length >= 2) {
      fetchSearchResults();
    } else {
      setUserlist(users);
    }
  }, [searchtext, users, currentPage]);

  const BlockStatus = async (userId: string, currentStatus: boolean) => {
    Swal.fire({
      title: `Are you sure you want to ${
        currentStatus ? "unblock" : "block"
      } this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const endpoint = currentStatus
            ? `/auth/unblock/${userId}`
            : `/auth/block/${userId}`;
          await AdminAxios.put(endpoint, { blocked: !currentStatus });

          setUserlist((prevUsers) =>
            prevUsers.map((user) =>
              user._id === userId ? { ...user, blocked: !currentStatus } : user
            )
          );

          Swal.fire(
            `${currentStatus ? "Unblocked" : "Blocked"}!`,
            `The user has been ${currentStatus ? "unblocked" : "blocked"}.`,
            "success"
          );
        } catch (error) {
          console.error("Error updating user:", error);
          Swal.fire(
            "Error!",
            "There was an error updating the user. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const handlesort = () => {
    setShowsort(!showsort);
  };

  const sortAZ = () => {
    const sortedUsers = [...userlist].sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    setUserlist(sortedUsers);
    setShowsort(false);
  };

  const sortZA = () => {
    const sortedUsers = [...userlist].sort((a, b) =>
      b.username.localeCompare(a.username)
    );
    setUserlist(sortedUsers);
    setShowsort(false);
  };

  const Deleteuser = async (userId: string) => {
    Swal.fire({
      title: `Are you sure you want to delete this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await AdminAxios.delete(`/auth/deleteuser/${userId}`);
          setUserlist((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
          Swal.fire("Deleted", "The user has been deleted", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire(
            "Error!",
            "There was an error deleting the user. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="user-table">
      <h2>User List</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchtext}
          onChange={(e) => setSearchtext(e.target.value)}
        />
        <button
          className="usersearch-btn"
          onClick={() => setSearchtext(searchtext)}
        >
          Search
        </button>
        <div className="sort-container">
          <button className="sort-btn" onClick={handlesort}>
            Sort
          </button>
          {showsort && (
            <div className="sortfrom">
              <button className="AZ-btn" onClick={sortAZ}>
                A-Z
              </button>
              <button className="AZ-btn" onClick={sortZA}>
                Z-A
              </button>
            </div>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Profile Picture</th>
            <th>Status</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>Loading...</td>
            </tr>
          ) : (
            userlist.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <img src={user.profilePicture} alt="Profile" width="50" />
                </td>
                <td>{user.blocked ? "Blocked" : "Unblocked"}</td>
                <td>
                  <button
                    className={`block-btn ${
                      user.blocked ? "unblock" : "block"
                    }`}
                    onClick={() => BlockStatus(user._id, user.blocked)}
                  >
                    {user.blocked ? "Unblock" : "Block"}
                  </button>
                </td>
                <td>
                  <button className="delete-btn">
                    <FontAwesomeIcon
                      icon={faTrash}
                      onClick={() => Deleteuser(user._id)}
                    />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminUserlist: React.FC = () => {
  return (
    <>
      <Sidebar />
      <UserTable />
    </>
  );
};

export default AdminUserlist;
