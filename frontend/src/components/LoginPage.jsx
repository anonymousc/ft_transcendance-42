import { User, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import "./LoginPage.css";
import SigninOuth from "./SigninOuth.jsx";

function LoginPage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        console.log('Login attempt:', { username, password });
    };

    return (
        <main className="login-page">
            <Link to="/" className="back-arrow">
                <ArrowLeft size={28} />
            </Link>
            <div className="login-container">
                <h2>Sign in</h2>
                <div>
                    <p>Sign in with open accounts</p>
                    <SigninOuth />
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <p>Or use your username and password</p>
                    
                    <div className="input-wrapper">
                        <User className="input-icon" size={20} />
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Username"
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
        </main>
    );
}

export default LoginPage;