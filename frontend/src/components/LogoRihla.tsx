import "./LogoRihla.css";
import { Link } from "react-router-dom";
import RihlaimgOrange from "../assets/RIHLA-orange.svg";

function LogoRihla() {
    return (
        <div className="logo">
            <Link to="/home" aria-label="Go to home">
                <img
                    src={RihlaimgOrange}
                    alt="Rihla"
                    className="logo-img"
                />
            </Link>
        </div>
    );
}
export default LogoRihla;