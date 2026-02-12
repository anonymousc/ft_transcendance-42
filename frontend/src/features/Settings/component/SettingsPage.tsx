import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Moon, Bell, Trash2, ChevronRight } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import "./SettingsPage.css";

function SettingsPage() {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
    });

    return (
        <main className="settings-page">
            <Link to="/home" className="back-arrow">
                <ArrowLeft size={28} />
            </Link>

            <div className="settings-container">
                <h1 className="settings-title">Settings</h1>

                {/* ── Account ── */}
                <div className="settings-section">
                    <p className="settings-section-title">Account</p>

                    <div
                        className="settings-row settings-row-clickable"
                        onClick={() => navigate("/profile")}
                    >
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-blue">
                                <User />
                            </span>
                            <div>
                                <span className="settings-row-label">Profile Info</span>
                                <p className="settings-row-sublabel">Name, email, phone</p>
                            </div>
                        </div>
                        <ChevronRight className="settings-row-chevron" />
                    </div>

                    <div
                        className="settings-row settings-row-clickable"
                        onClick={() => console.log("Change password")}
                    >
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-orange">
                                <Lock />
                            </span>
                            <span className="settings-row-label">Change Password</span>
                        </div>
                        <ChevronRight className="settings-row-chevron" />
                    </div>
                </div>

                {/* ── Preferences ── */}
                <div className="settings-section">
                    <p className="settings-section-title">Preferences</p>

                    <div className="settings-row">
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-purple">
                                <Moon />
                            </span>
                            <span className="settings-row-label">Dark Mode</span>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={isDark}
                                onChange={toggleTheme}
                            />
                            <span className="settings-toggle-track" />
                        </label>
                    </div>
                </div>

                {/* ── Notifications ── */}
                <div className="settings-section">
                    <p className="settings-section-title">Notifications</p>

                    <div className="settings-row">
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-green">
                                <Bell />
                            </span>
                            <span className="settings-row-label">Push Notifications</span>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={() =>
                                    setNotifications((prev) => ({ ...prev, push: !prev.push }))
                                }
                            />
                            <span className="settings-toggle-track" />
                        </label>
                    </div>

                    <div className="settings-row">
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-green">
                                <Bell />
                            </span>
                            <span className="settings-row-label">Email Notifications</span>
                        </div>
                        <label className="settings-toggle">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() =>
                                    setNotifications((prev) => ({ ...prev, email: !prev.email }))
                                }
                            />
                            <span className="settings-toggle-track" />
                        </label>
                    </div>
                </div>

                {/* ── Danger Zone ── */}
                <div className="settings-section">
                    <div
                        className="settings-row settings-row-clickable settings-row-danger"
                        onClick={() => console.log("Delete account")}
                    >
                        <div className="settings-row-left">
                            <span className="settings-row-icon icon-red">
                                <Trash2 />
                            </span>
                            <span className="settings-row-label">Delete Account</span>
                        </div>
                        <ChevronRight className="settings-row-chevron" />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default SettingsPage;
