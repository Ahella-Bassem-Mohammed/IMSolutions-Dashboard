import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../context/AuthContext";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("Verifying...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("No verification token provided.");
      return;
    }
    axios
      .get(`${API_URL}/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus(res.data.message);
        setSuccess(true);
      })
      .catch((err) =>
        setStatus(err.response?.data?.message || "Verification failed"),
      );
  }, [token]);

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">{status}</h2>
        {success && (
          <Link to="/" className="btn btn-primary login-button">
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
