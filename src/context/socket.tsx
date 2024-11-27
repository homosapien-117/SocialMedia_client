import { io, Socket } from "socket.io-client";
import { createContext, useState, useEffect } from "react";
import CustomAlert from "../components/alert/alert";

interface SocketContextProps {
  children: React.ReactNode;
}

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
});

const SocketProvider = ({ children }: SocketContextProps) => {
  const userdata = JSON.parse(localStorage.getItem("user_data") || "{}");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io("https://socialmedia-server-zflk.onrender.com"); //http://localhost:4000
    setSocket(socketInstance);

    if (userdata && userdata?.user?._id) {
      socketInstance.emit("register", userdata?.user?._id);
    }

    socketInstance.on("connected", () => {
      console.log("user Connected the room");
    });
    socketInstance.on("new notification", (notification) => {
      console.log("Notification received:", notification);
    });

    socketInstance.on("new comment", (notification) => {
      console.log("Comment received:", notification);
      alert("notification send");
    });

    socketInstance.on("receiveMessage", (message) => {
      console.log("Message received:", message);
      setAlertMessage(`New message from ${message.senderName}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
