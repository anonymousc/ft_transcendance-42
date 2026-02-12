import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import pdp from "../../../assets/pdp1.png";
import "./ProfilePage.css";

function ProfilePage() {
    const user = {
        name: "Ilyass",
        email: "ilyass@example.com",
        phone: "+212 600 000 000",
        location: "Casablanca, Morocco",
    };

    return (
        <main className="profile-page">
            <Link to="/home" className="back-arrow">
                <ArrowLeft size={28} />
            </Link>

            <div className="profile-card">
                <div className="profile-header">
                    <img
                        src={pdp}
                        alt={user.name}
                        className="profile-avatar"
                    />
                    <h1 className="profile-name">{user.name}</h1>
                    <p className="profile-email">{user.email}</p>
                </div>

                <div className="profile-info">
                    <div className="profile-info-item">
                        <span className="profile-info-label">Full Name</span>
                        <span className="profile-info-value">{user.name}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Email</span>
                        <span className="profile-info-value">{user.email}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Phone</span>
                        <span className="profile-info-value">{user.phone}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Location</span>
                        <span className="profile-info-value">{user.location}</span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        className="profile-btn profile-btn-primary"
                        onClick={() => console.log("Edit profile")}
                    >
                        Edit Profile
                    </button>
                    <button
                        className="profile-btn profile-btn-secondary"
                        onClick={() => console.log("Change password")}
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;
