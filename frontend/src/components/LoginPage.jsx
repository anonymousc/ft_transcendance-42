import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./LoginPage.css";
import SigninOuth from "./SigninOuth.jsx";
import passportOverlay from '../assets/PassportOverlay.png';

function LoginPage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        console.log('Login attempt:', { email, password });
    };

    return (
        <main className="login-page">
            <Link to="/" className="back-arrow">
                <ArrowLeft size={28} />
            </Link>
            <div className="blob blob-card-left"></div>
            <div className="blob blob-card-center"></div>

            <div className="blob blob-card-right"></div>
            
            <div className="login-card">
                <div className="passport-side">
                    <img 
                        src={passportOverlay} 
                        alt="Passport overlay" 
                        className="passport-overlay"
                    />
                </div>
                <div className="signin-side">
                    <h2>Sign in</h2>
                    <div className="oauth-section">
                        <p>Sign in with open accounts</p>
                        <SigninOuth />
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <p>Or with your email and password</p>
                        
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="Email"
                                required 
                            />
                        </div>

                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Password"
                                required 
                            />
                        </div>

                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;