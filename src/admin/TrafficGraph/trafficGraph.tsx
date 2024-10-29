import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {AdminAxios} from "../../axios";
import "./trafficGraph.css";
import { format } from "date-fns";

const TrafficGraph = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (startDate && endDate) {
        try {
          const formattedStartDate = format(startDate, "yyyy-MM-dd");
          const formattedEndDate = format(endDate, "yyyy-MM-dd");
          const response = await AdminAxios.get("/auth/registrations", {
            params: { startDate: formattedStartDate, endDate: formattedEndDate },
          });
          setData(response.data.data);
        } catch (error) {
          console.error("Error fetching registration stats", error);
        }
      }
    };

    fetchRegistrationData();
  }, [startDate, endDate]);

  return (
    <div>
      <div className="date-picker-container">
        <label>Select Start Date: </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Start Date"
        />
        <label>Select End Date: </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="End Date"
        />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficGraph;
