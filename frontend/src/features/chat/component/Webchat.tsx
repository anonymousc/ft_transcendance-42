import "./Webchat.css"
import GlassNavBar from "@/components/shared/GlassNavBar";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ID_TO_PATH: Record<string, string> = {
    home: "/home",
    messages: "/webchat",
    friends: "/friends",
    notifications: "/notifications",
};

const PATH_TO_NAV_ID: Record<string, string> = {
    "/home": "home",
    "/webchat": "messages",
    "/friends": "friends",
    "/notifications": "notifications",
};

function Webchat() {
    const navigate = useNavigate();
    const location = useLocation();
    const activeId = PATH_TO_NAV_ID[location.pathname] ?? "home";

    const handleNavigation = (id: string) => {
        const path = NAV_ID_TO_PATH[id];
        if (path) navigate(path);
    };

    return(
        <>
        <GlassNavBar activeId={activeId} handleNavigation={handleNavigation} />
        <main className="webchat-page">
            <h1>Webchat</h1>
        </main>
        </>
    );
}
export default Webchat;