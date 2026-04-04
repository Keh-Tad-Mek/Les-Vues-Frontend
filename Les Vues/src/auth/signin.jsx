import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthForm from '../Components/AuthForm'
import './signup.css'
import { authClient } from '../lib/auth-client'

function Signin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isEmailEmpty = email.trim() === ""
    const isPasswordEmpty = password.trim() === ""

    setEmailError(isEmailEmpty)
    setPasswordError(isPasswordEmpty)

    if (!isEmailEmpty && !isPasswordEmpty) {
      // Use Better Auth's built-in sign-in method
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password
      })

      if (error) {
        console.error("Error signing in:", error.message) 
        // You can set an error state here to show the user
      } else if(data?.user) {
        console.log("Signed in successfully!", data)
        // Redirect user here, e.g., using React Router's useNavigate()
      }
    } else {
      console.log("Please fill in all fields")
    }
  }

  useEffect(() => {
    let timer
    if (emailError) {
      timer = setTimeout(() => {
        setEmailError(false)
      }, 5000) 
    }
    return () => clearTimeout(timer)
  }, [emailError])

  useEffect(() => {
    let timer
    if (passwordError) {
      timer = setTimeout(() => {
        setPasswordError(false)
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [passwordError])

  return (
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
    >
      <p style={{marginBottom:'18px', marginTop:'18px'}}>
        <Link to="#">Forgot Password?</Link>
      </p>
    </AuthForm>
  )
}

export default Signin