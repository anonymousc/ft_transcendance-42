import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ProfilePage.css";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchMyProfile, toProfileAvatarUrl } from "../../../lib/profilesApi";

function ProfilePage() {
  const { user, loading } = useAuth();
  const [profileBio, setProfileBio] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyProfile()
      .then((p) => {
        if (cancelled) return;
        setProfileBio(p.bio ?? null);
        setProfileAvatar(toProfileAvatarUrl(p.avatar ?? null));
      })
      .catch(() => {
        // non-critical; fallback to auth-service user fields
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <Link to="/home" className="back-arrow">
        <ArrowLeft size={28} />
      </Link>

      <div className="profile-card">
        <div className="profile-header">
          <img
            src={profileAvatar || user?.avatar || "/profile.png"}
            alt={user?.displayName || "Profile"}
            className="profile-avatar"
          />
          <h1 className="profile-name">
            {user?.displayName || user?.username || "Unknown"}
          </h1>
          <p className="profile-email">{user?.email || ""}</p>
        </div>

        <div className="profile-info">
          <div className="profile-info-item">
            <span className="profile-info-label">Display Name</span>
            <span className="profile-info-value">
              {user?.displayName || "—"}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Username</span>
            <span className="profile-info-value">{user?.username || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Bio</span>
            <span className="profile-info-value">{profileBio || user?.bio || "—"}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Status</span>
            <span className="profile-info-value">
              {user?.status || "offline"}
            </span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Share my profile</span>
            <span className="profile-info-value">Private</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
