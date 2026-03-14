import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './signup.css'

function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    const isEmailEmpty = email.trim() === ""
    const isPasswordEmpty = password.trim() === ""

    setEmailError(isEmailEmpty)
    setPasswordError(isPasswordEmpty)

    if (!isEmailEmpty && !isPasswordEmpty) {
      console.log("Form valid, sending to backend...")
    }
  }

  // Effect to handle timeout for email error
  useEffect(() => {
    let timer
    if (emailError) {
      timer = setTimeout(() => {
        setEmailError(false)
      }, 5000) // 5 minutes = 300000ms
    }
    return () => clearTimeout(timer)
  }, [emailError])

  // Effect to handle timeout for password error
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
    <>
      <form onSubmit={handleSubmit}>
        <h1>Les Vues</h1>
        
        <input 
          type='email' 
          className="email-input"
          style={{  
            border: `1px solid ${emailError ? 'red' : 'transparent'}`,
          }}
          placeholder='E-mail'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError(false)
          }}
        />

        <input 
          type='password' 
          className="password-input"
          placeholder='Password'
          value={password}
          style={{
            border: `1px solid ${passwordError ? 'red' : 'transparent'}`
          }}
          onChange={(e) => {
            setPassword(e.target.value)
            setPasswordError(false)
          }}
        />

        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        <button type='submit'>Sign In</button>

        <p style={{marginBottom:'18px', marginTop:'18px'}}><Link to="#">Forgot Password?</Link></p>
      </form>
    </>
  )
}

export default App