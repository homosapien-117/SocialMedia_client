import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {AdminAxios} from "../../axios";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Sidebar from "../../components/adminsidebar/adminSidebar";
import "./reportTable.css";
import { Report } from "../../Interfaces/adminInterface";


const ReportDetailsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { admintoken } = useAdminAuth();
  const [reportDetails, setReportDetails] = useState<Report[]>([]);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      const response = await AdminAxios.get(`/auth/reportdetails/${postId}`, {
        headers: { Authorization: `Bearer ${admintoken}` },
      });
      setReportDetails(response.data);
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  return (
    <div className="report-details-container" style={{ display: "flex" }}>
      <Sidebar />
      <div
        className="report-details-content"
        style={{ flex: 1, padding: "20px" }}
      >
        <h2>Report Details</h2>
        <table
          className="report-details-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Reported At</th>
            </tr>
          </thead>
          <tbody>
            {reportDetails.map((report, index) => (
              <tr key={index}>
                <td>{report.reportedUser.username}</td>
                <td>{report.report.reason}</td>
                <td>
                  {new Date(report.report.reportedDatetime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDetailsPage;