import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../Components/AuthForm'
import signupStyles from './signup.module.css'
import { authClient } from '../lib/auth-client'

function Signin() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpValue, setOtpValue] = useState("")
  
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [displayOTPField, setdisplayOTPField] = useState("none")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isEmailEmpty = email.trim() === ""
    const isPasswordEmpty = password.trim() === ""

    setEmailError(isEmailEmpty)
    setPasswordError(isPasswordEmpty)

    if (!isEmailEmpty && !isPasswordEmpty) {
      // 1. Attempt Sign In
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      }, {
        onSuccess: () => {
            navigate("/home", { replace: true })
        },
        onError: (ctx) => {
            // Better Auth returns a specific error if verification is required
            if (ctx.error.status === 403 || ctx.error.message.includes("email_not_verified")) {
                handleResendOtp() // Trigger OTP send if they aren't verified
            } else {
                setErrorMessage(ctx.error.message || "Invalid credentials")
                console.error("Login Error:", ctx.error)
            }
        }
      })
    }
  }

  // Helper to trigger OTP if the user exists but isn't verified
  const handleResendOtp = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: "sign-in" // This sends the OTP to the user
    })

    if (!error) {
      setdisplayOTPField("flex")
      setErrorMessage("Verification required. Please check your email.")
    } else {
      setErrorMessage(error.message)
    }
  }

  // 2. Verify OTP during Sign-in flow
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    const { data, error } = await authClient.emailOtp.verifyEmail({
      email: email,
      otp: otpValue
    })

    if (error) {
      setErrorMessage("Invalid Code")
    } else {
      // Once verified, Better Auth (with autoSignInAfterVerification) 
      // will establish the session.
      navigate("/home", { replace: true })
    }
  }

  // Clear errors after timeout
  useEffect(() => {
    if (emailError || passwordError || errorMessage) {
      const timer = setTimeout(() => {
        setEmailError(false)
        setPasswordError(false)
        setErrorMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [emailError, passwordError, errorMessage])

  return (
    <div className={signupStyles.root}>
      <div className="signin-container">
        {errorMessage && (
          <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>
            {errorMessage}
          </div>
        )}
        
        <AuthForm
          onSubmit={handleSubmit}
          emailValue={email}
          onEmailChange={(val) => {
            setEmail(val)
            setEmailError(false)
          }}
          emailBorderColor={emailError ? 'red' : 'transparent'}
          passwordValue={password}
          onPasswordChange={(val) => {
            setPassword(val)
            setPasswordError(false)
          }}
          passwordBorderColor={passwordError ? 'red' : 'transparent'}
          footerText="Don't have an account?"
          footerLinkText="Sign Up"
          footerLinkTo="/signup"
          submitButtonText="Login"
          
          // OTP Props (Matching your Signup.jsx logic)
          displayOTPField={displayOTPField}
          otpValue={otpValue}
          onOtpChange={setOtpValue}
          onVerifyOtp={handleVerifyOtp}
        >
          <p style={{ marginBottom: '18px', marginTop: '18px' }}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </AuthForm>
      </div>
    </div>
  )
}

export default Signin