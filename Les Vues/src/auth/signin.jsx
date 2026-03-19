import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthForm from '../Components/AuthForm'
import './signup.css'

function signin() {
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

    // FIX 1: This condition was backwards
    // Original: if (isEmailEmpty && isPasswordEmpty) - wrong
    // Should be: if NOT empty, then submit
    if (!isEmailEmpty && !isPasswordEmpty) {
      try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signin`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',  // FIX 2: Capital T in Content-Type
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        })

        if (!response.ok) {  // FIX 3: Check if response failed
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Backend response:", data)
        // FIX 4: Handle success (redirect, show message, etc.)
      } catch(error) {
        console.error("Error sending to backend:", error)  // FIX 5: Show actual error
        // FIX 6: Show user-friendly error message
      }
    } else {
      // FIX 7: Optionally show message that fields are required
      console.log("Please fill in all fields")
    }
  }

  // FIX 8: Fixed timer comment (was 5 minutes, actually 5 seconds)
  useEffect(() => {
    let timer
    if (emailError) {
      timer = setTimeout(() => {
        setEmailError(false)
      }, 5000)  // Actually 5 seconds, not 5 minutes
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
      submitButtonText="Sign In"
    >
      <p style={{marginBottom:'18px', marginTop:'18px'}}>
        <Link to="#">Forgot Password?</Link>
      </p>
    </AuthForm>
  )
}

export default signin