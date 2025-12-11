import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProfilePage() {
  const { userId } = useParams();
  console.log(userId);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate =useNavigate()

  useEffect(() => {
  async function fetchProfile() {
    if (!userId) return;

    try {
      const token = localStorage.getItem("token"); // get token from login
      if (!token) {
       navigate("/login")
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/v1/users/c/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data.data);
      setProfile(res.data.data); // data is inside res.data.data
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token"); // clear invalid token
        navigate("/login");               // redirect to login
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  fetchProfile();
}, [userId]);
const fetchProfile = async()=>{
  const token = localStorage.getItem("token");
  if(!token) return null;
  try {
     const res = await axios.get(
          `http://localhost:5000/api/v1/users/c/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  } catch (error) {
    
  }
}


  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>User not found</div>;
  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Navigate to login page
    navigate("/login");
  };
 const updateProfile= ()=>{
    navigate(`/c/${userId}/update`)
  }
 return (
  <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-2xl overflow-hidden">
    {/* Cover Image */}
    {profile.coverImage && (
      <div className="w-full h-32 bg-gray-200">
        <img
          src={profile.coverImage}
          alt="cover"
          className="w-full h-full object-cover"
        />
      </div>
    )}

    {/* Profile Info */}
    <div className="flex flex-col items-center mt-12 p-6">
      {/* Avatar */}
      {profile.avatar ? (
        <img
          src={profile.avatar}
          alt="avatar"
          className="w-24 h-24 rounded-full border-4 border-white object-cover"
        />
      ) : (
        <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-gray-600 text-xl">
          {profile.username?.[0]?.toUpperCase() || "U"}
        </div>
      )}

      {/* Name and Username */}
      <h1 className="mt-4 text-2xl font-semibold">{profile.fullname}</h1>
      <p className="text-gray-500">@{profile.username}</p>

      {/* Subscriber Info */}
      <div className="mt-3 flex space-x-6">
        <div className="text-center">
          <p className="font-semibold">{profile.subscriberCount || 0}</p>
          <p className="text-gray-400 text-sm">Subscribers</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{profile.channelSubscriberToCount || 0}</p>
          <p className="text-gray-400 text-sm">Subscribed To</p>
        </div>
      </div>

      {/* Optional: Edit Profile Button */}
      <div className="flex flex-row gap-5 ">
        <button
        onClick={updateProfile}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
        Edit Profile
      </button>
      
      <button 
      onClick={handleLogout}
      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
        Logout
      </button>
      </div>
    </div>
  </div>
);

}

export default ProfilePage;

