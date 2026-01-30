import "./LoginContainer.css";

function LoginContainer() {
    return (
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
    );
}

export default LoginContainer;