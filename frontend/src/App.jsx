import { Routes, Route } from "react-router-dom";
import Layout from "./component/Layout/Layout";
import Home from "./component/Home/Home";
import Register from "./component/Register/Register";
import Login from "./component/Login/Login";
import LikedVideos from "./component/LikedVideos/LikeVideos";
import Profile from "./component/Profile/Profile";
import Channel from "./component/Channel/Channel";
import VideoUpload from "./component/Channel/VideoUpload";
import WatchVideos from "./component/Watch/WatchVideos";
import UpdateProfile from "./component/Profile/UpdateProfile";
import ChannelStats from "./component/Channel/ChannelStats";
import ChangePassword from "./component/Profile/ChangePassword";
import Search from "./component/Search/Search";
// import Home from "./component/Home";
// import Layout from "./Layout/Layout";

function App() {
  return (
    <Routes>
      {/* All routes inside Layout will show Sidebar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/liked/:userId" element={<LikedVideos />} />
        <Route path="/c/:userId" element={<Profile />} />
        <Route path="/c/:userId/update" element={<UpdateProfile />}/>
        <Route path="/c/:userId/password" element={<ChangePassword />}/>
        <Route path="/channel" element={<Channel />} />
        <Route path="/channel/:userId" element={<Channel />} />
  <Route path="/channel/upload" element={<VideoUpload/>} />
  <Route path="/channel/:id/stats" element={<ChannelStats/>} />
  <Route path="/watch/:id" element={<WatchVideos/>} />
  <Route path="/search" element={<Search/>} />
  


        {/* Add more pages here */}
        {/* <Route path="/video/:id" element={<VideoPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;

