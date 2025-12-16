import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate()

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/search`,
          {
            params: { q: query }
          }
        );

        setVideos(res.data.data);
      } catch (error) {
        console.error("Search error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="lg:pt-20 px-6">
      <h2 className="text-xl font-semibold mb-4">
        Search results for "<span className="text-blue-600">{query}</span>"
      </h2>

      {videos.length === 0 ? (
        <p>No videos found</p>
      ) : (
        <div className="space-y-4 grid Lg:grid-cols-3 grid-cols-1 space-x-3">
          {videos.map((video) => (
            <div
              key={video._id}
              className=" max-w-xl flex flex-col items-center gap-4 border-b pb-4 cursor-pointer"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                onClick={() => navigate(`/watch/${video._id}`, { state: video })}
                className="w-60 h-36 rounded-lg object-cover"
              />

              <div>
                <h3 className="text-lg font-medium">{video.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {video.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {video.views} views
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
