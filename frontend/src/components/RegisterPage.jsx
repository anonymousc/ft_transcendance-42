import { Mail, Lock, ArrowLeft, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./RegisterPage.css";
import SigninOuth from "./SigninOuth.jsx";
import passportOverlay from '../assets/PassportOverlay.png';

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
            <Link to="/" className="back-arrow">
                <ArrowLeft size={28} />
            </Link>
            
            <div className="blob blob-card-left"></div>
            <div className="blob blob-card-center"></div>
            <div className="blob blob-card-right"></div>
            
            <div className="register-card">
                <div className="register-side">
                    <h2>Register</h2>
                    
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="name-row">
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    id="firstName" 
                                    name="firstName" 
                                    placeholder="First Name"
                                    required 
                                />
                            </div>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    id="lastName" 
                                    name="lastName" 
                                    placeholder="Last Name"
                                    required 
                                />
                            </div>
                        </div>

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
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                placeholder="Phone Number"
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

                        <div className="register-actions">
                            <span className="oauth-label">Or Register with :</span>
                            <button type="submit">Register</button>
                        </div>
                        
                        <div className="oauth-section">
                            <SigninOuth />
                            <span className="oauth-or">or</span>
                        </div>
                    </form>
                </div>
                <div className="passport-side">
                    <img 
                        src={passportOverlay} 
                        alt="Passport overlay" 
                        className="passport-overlay"
                    />
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;
