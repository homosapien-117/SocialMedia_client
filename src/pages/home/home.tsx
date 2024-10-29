import "./home.css";
import { useState, lazy} from "react";
import Sidebar from "../../components/sidebar/sidebar";
import Navbar from "../../components/navbar/navbar";
import AddPost from "../../components/Addpost/Addpost";
const FollowedPosts = lazy(() => import('../../components/allpost/allpost'));

const Homepage = () => {
  const [postsUpdated, setPostsUpdated] = useState<boolean>(false);

  const handlePostUpdate = () => {
    setPostsUpdated((prev) => !prev);
  };

  return (
    <div className="Home-container">
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="addpost">
          <AddPost onPostAdded={handlePostUpdate} />
          <div className="user-posts">
            <FollowedPosts key={postsUpdated ? "updated" : "initial"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
