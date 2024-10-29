import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {AdminAxios} from "../../axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./impressionGraph.css";
import { Postinterface } from "../../Interfaces/postInterface";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const ImpressionGraph: React.FC = () => {
  const [posts, setPosts] = useState<Postinterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchAllPosts();
  }, [startDate, endDate]); 

  const fetchAllPosts = async () => {
    try {
    
      const response = await AdminAxios.get("/auth/posts", {
        params: {
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
        },
      });

      const sortedPosts = response.data.sort(
        (a: Postinterface, b: Postinterface) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to fetch posts.");
      setLoading(false);
    }
  };

  const prepareGraphDataByMonth = () => {
    const monthMap: { [key: string]: { likes: number; comments: number } } = {};

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap[month]) {
        monthMap[month] = { likes: 0, comments: 0 };
      }

      monthMap[month].likes += post.likes.length;
      monthMap[month].comments += post.comments.length;
    });

    const sortedMonths = Object.keys(monthMap).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const likesData = sortedMonths.map((month) => monthMap[month].likes);
    const commentsData = sortedMonths.map((month) => monthMap[month].comments);

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Likes",
          data: likesData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Comments",
          data: commentsData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    };
  };

  const prepareGraphData = () => {
    return prepareGraphDataByMonth();
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Posts: Likes and Comments",
      },
    },
  };

  if (loading) {
    return <div>Loading graph...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (posts.length === 0) {
    return <div>No posts available to display.</div>;
  }

  const handleDateChange = (date: Date | null, type: "start" | "end") => {
    if (type === "start") {
      setStartDate(date || undefined); 
    } else {
      setEndDate(date || undefined); 
    }
  }

  return (
    <div className="impression-graph-container">
      <div className="date-picker-container">
        <label>Select Date Range:</label>
        <div className="date-picker">
          <DatePicker
            selected={startDate}
            onChange={(date) =>  handleDateChange(date, "start")}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            isClearable
            placeholderText="Start Date"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChange(date, "end")}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            isClearable
            placeholderText="End Date"
            minDate={startDate}
          />
        </div>
      </div>
      <Bar data={prepareGraphData()} options={options} />
    </div>
  );
};

export default ImpressionGraph
