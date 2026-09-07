import { useEffect, useRef } from "react";
import axios from "axios";

function GoogleLogin({ onSuccess }) {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

        callback: handleGoogleResponse,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 350,
          text: "continue_with",
          shape: "rectangular",
        }
      );
    };

    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initializeGoogle();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/google`,
        {
          credential: response.credential,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Google Login:", res.data);

      if (res.data.success) {
        const data = res.data.data;

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refresh", data.refreshToken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data._id);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (onSuccess) {
          onSuccess(data.user);
        }
      }
    } catch (error) {
      console.error(
        "Google login error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Google login failed"
      );
    }
  };

  return (
    <div
      ref={googleButtonRef}
      className="flex justify-center"
    />
  );
}

export default GoogleLogin;