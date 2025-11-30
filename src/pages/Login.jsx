import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
    const { loginAdmin, loginCustomer, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState('login')
    const [loginType, setLoginType] = useState('admin')
    const [phoneOrEmail, setPhoneOrEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (isAuthenticated) {
        return null
    }

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'Password must be at least 8 characters long'
        if (!/[a-zA-Z]/.test(pwd)) return 'Password must contain at least one letter'
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!phoneOrEmail || !password) {
            setError('Please enter all credentials')
            return
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }

        setLoading(true)
        try {
            if (mode === 'signup') {
                setError('Signup not yet implemented')
            } else {
                if (loginType === 'admin') {
                    await loginAdmin(phoneOrEmail, password)
                    navigate('/admin/dashboard')
                } else {
                    // Customer login with phone number
                    await loginCustomer(phoneOrEmail, password)
                    navigate('/customer/dashboard')
                }
            }
        } catch (err) {
            setError(err.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login')
        setError('')
        setPhoneOrEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    return (
        <div className="login-page">
            <div className="decorative-bg">
                <img src="/assets/icon-1.png" className="floating-icon icon-1" alt="" />
                <img src="/assets/icon-2.png" className="floating-icon icon-2" alt="" />
                <img src="/assets/icon-3.png" className="floating-icon icon-3" alt="" />
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>{mode === 'login' ? 'Welcome back!' : 'Hello!'}</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur</p>
                    </div>

                    <div className="tab-navigation">
                        <button
                            className={`tab ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => setMode('login')}
                            type="button"
                        >
                            Login
                        </button>
                        <button
                            className={`tab ${mode === 'signup' ? 'active' : ''}`}
                            onClick={() => setMode('signup')}
                            type="button"
                        >
                            Signup
                        </button>
                    </div>

                    {mode === 'login' && (
                        <div className="user-type-toggle">
                            <label>
                                <input
                                    type="radio"
                                    name="loginType"
                                    value="admin"
                                    checked={loginType === 'admin'}
                                    onChange={(e) => setLoginType(e.target.value)}
                                />
                                <span>Admin</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="loginType"
                                    value="customer"
                                    checked={loginType === 'customer'}
                                    onChange={(e) => setLoginType(e.target.value)}
                                />
                                <span>Customer</span>
                            </label>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form" noValidate>
                        <div className="input-group">
                            <input
                                type={mode === 'signup' ? 'email' : 'text'}
                                value={phoneOrEmail}
                                onChange={(e) => setPhoneOrEmail(e.target.value)}
                                placeholder={
                                    mode === 'signup'
                                        ? 'Email Address'
                                        : loginType === 'admin'
                                            ? 'Username'
                                            : 'Phone Number'
                                }
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {mode === 'signup' && (
                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="forgot-password">
                                <a href="#forgot">Forgot Password?</a>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Please wait...' : mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                        </button>

                        {mode === 'login' && (
                            <div className="helper-text">
                                <p>
                                    {loginType === 'admin'
                                        ? 'Default: admin / Admin123'
                                        : 'Use your phone number to login'}
                                </p>
                            </div>
                        )}
                    </form>

                    <div className="mode-switch">
                        <button onClick={switchMode} type="button">
                            {mode === 'login' ? 'SIGN UP' : 'SIGN IN'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
