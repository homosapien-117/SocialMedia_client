
import React from "react";
import ImpressionGraph from "../ImpressionGraph/impressionGraph";
import TrafficGraph from "../TrafficGraph/trafficGraph";
import Sidebar from "../../components/adminsidebar/adminSidebar";
import "./adminDashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
     
      <div className="dashboard-content">
        <Sidebar />
        <main className="main-content">
          <h1>Welcome to Your Dashboard</h1>
          <h2>Impression Graph</h2>
          <ImpressionGraph />
          {/* You can add more components or sections here */}

          <h2>Traffic Graph</h2>
          <TrafficGraph /> 
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
