import { Mail, Lock, ArrowLeft, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./RegisterPage.css";
import SigninOuth from "./SigninOuth.jsx";
import passportOverlay from '../assets/PassportOverlay.png';
import RegisterForm from './RegisterForm.jsx';
import GlassCard from './glassCard.jsx';
import BackArrow from './BackArrow.jsx';

function RegisterPage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        console.log('Register attempt:', { firstName, lastName, email, phone, password });
    };

    return (
        <main className="register-page">
            <BackArrow />
            <div className="blob blob-card-left"></div>
            <div className="blob blob-card-center"></div>
            <div className="blob blob-card-right"></div>
            <div className="register-card">
                <div className="register-side">
                    <h2>Register</h2>
                    <RegisterForm handleSubmit={handleSubmit} />
                </div>
                <GlassCard imageOverlay={passportOverlay} />
            </div>
        </main>
    );
}

export default RegisterPage;
