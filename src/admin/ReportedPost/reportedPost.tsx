import React, { useState, useEffect } from "react";
import Sidebar from "../../components/adminsidebar/adminSidebar";
import {AdminAxios} from "../../axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./reportedPost.css";
import { User } from "../../Interfaces/profileInterface";
import { Postinterface } from "../../Interfaces/postInterface";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Report } from "../../Interfaces/adminInterface";


const ReportTable: React.FC = () => {
  const { admintoken } = useAdminAuth();
  const [reportlist, setReportlist] = useState<
    { post: Postinterface ; details: Report[]; postOwner: User | null }[]
  >([]);
  const [searchtext, setSearchtext] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const reportsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchtext]);

  const fetchReports = async () => {
    try {
      const response = await AdminAxios.get("/auth/reportedposts", {
        headers: { Authorization: `Bearer ${admintoken}` },
        params: {
          page: currentPage,
          limit: reportsPerPage,
          search: searchtext,
        },
      });

      if (response.data && Array.isArray(response.data.reports)) {
        const reportsArray: Report[] = response.data.reports;
        setTotalPages(Math.ceil((response.data.total | 0) / reportsPerPage))
        
        aggregateReports(reportsArray);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error("Error fetching reported posts:", error);
    }
  };

  const aggregateReports = (reports: Report[]) => {
    console.log(reports);
    
    const groupedReports: {
      [key: string]: { post: Postinterface ; details: Report[]; postOwner: User | null };
    } = {};

    reports.forEach((report) => {
      if (report && report.post) { 
        const postId = report.post._id;
        if (!groupedReports[postId]) {
          groupedReports[postId] = {
            post: report.post,
            details: [],
            postOwner: report.postOwner || null,
          };
        }
        groupedReports[postId].details.push(report);
      } else {
        console.error('Invalid report or post:', report);
      }
    });

    setReportlist(Object.values(groupedReports));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const viewDetails = (postId: string) => {
    navigate(`/reportdetails/${postId}`);
  };

  const toggleBlockPost = async (postId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'Unblock' : 'Block';
    const confirmation = await Swal.fire({
      title:` Are you sure?`,
      text:` You are about to ${action} this post.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action} it!`,
    });

    if (confirmation.isConfirmed) {
      try {
        await AdminAxios.post(`/auth/${action.toLowerCase()}post/${postId}`, {}, {
          headers: { Authorization: `Bearer ${admintoken}` },
        });
        Swal.fire(
         ` ${action}d!`,
          `The post has been ${action.toLowerCase()}ed.`,
          'success'
        );
        fetchReports();
      } catch (error) {
        console.error(`Error ${action.toLowerCase()}ing the post:`, error);
        Swal.fire(
          'Error!',
         ` There was an issue ${action.toLowerCase()}ing the post.`,
          'error'
        );
      }
    }
  };

  return (
    <div className="reported-posts-container">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by description or owner"
          value={searchtext}
          onChange={(e) => {
            setSearchtext(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button className="search-btn" onClick={() => setCurrentPage(1)}>
          Search
        </button>
      </div>
      <table className="reported-posts-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Posted By</th>
            <th>Post Images</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reportlist.length === 0 ? (
            <tr>
              <td colSpan={5}>No reports found</td>
            </tr>
          ) : (
            reportlist.map((group) => (
              <React.Fragment key={group.post._id}>
                <tr>
                  <td>{group.post.desc}</td>
                  <td>{group.postOwner ? group.postOwner.username : "Unknown"}</td>
                  <td>
                    {group.post.img && group.post.img.length > 0 ? (
                      group.post.img.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt="Post"
                          width="50"
                          style={{ marginRight: "8px" }}
                        />
                      ))
                    ) : (
                      "No images"
                    )}
                  </td>
                  <td>
                    <button
                      className="actions-button"
                      onClick={() => viewDetails(group.post._id)}
                    >
                      View Details
                    </button>
                  </td>
                  <td>
                    <button
                      className={`block-button ${group.post.blocked ? 'unblock' : 'block'}`}
                      onClick={() => toggleBlockPost(group.post._id, group.post.blocked)}
                    >
                      {group.post.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index + 1}
              className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

const ReportedPosts: React.FC = () => {
  return (
    <>
      <Sidebar />
      <ReportTable />
    </>
  );
};

export default ReportedPosts;
