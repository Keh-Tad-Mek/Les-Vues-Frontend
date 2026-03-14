import { useState } from 'react'
import './signup.css'
import { Link } from 'react-router-dom'



function calculatePasswordStrength(password) {
  const checks = [
    /[A-Z]/,             
    /[a-z]/,           
    /[0-9]/,             
    /[^A-Za-z0-9]/,      
    /.{10,}/          
  ]

  const verbalStrengthDictionary = {
    0: "Weak",
    20: "Weak",
    40: "Medium",
    60: "Ok",
    80: "Good",
    100: "Strong"
  }

  let strengthValue = 0
  
  checks.forEach((check)=>{
    if (check.test(password))
      strengthValue += 20
  })

  const verbalStrengthValue = verbalStrengthDictionary[strengthValue]
  const hue = strengthValue <= 20 ? 0 : (strengthValue - 20) * 1.5

  return {
    strengthValue,
    verbalStrengthValue,
    hue
  }
}



function checkEmail(email){
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)){
    var emailIsValid = false
    return {emailIsValid}
  }

  else {
    var emailIsValid = true
    return {emailIsValid}
  }
}





function App() {
  const [passwordChecker, setPasswordChecker] = useState("")
  const [emailChecker, setEmailChecker] = useState("")
  const [emailFieldOutline, setEmailFieldOutline] = useState("none")
  const [PasswordStrengthVisibility, setPasswordStrengthVisibility] = useState("none")
  // Call the function
  const { strengthValue, verbalStrengthValue, hue } = calculatePasswordStrength(passwordChecker)
  const { emailIsValid } = checkEmail(emailChecker)
  const [EmailBorderColor, setEmailBorderColor] = useState("transparent")
  const [PasswordBorderColor, setPasswordBorderColor] = useState("transparent")
  

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log("Submit")

    setEmailBorderColor(emailIsValid ? "transparent" : "red")
    setPasswordBorderColor(strengthValue >= 80 ? "transparent" : "red")
    setTimeout(() => {
      setEmailBorderColor("transparent")
      setPasswordBorderColor("transparent")
    }, 5000)


    if (!(emailIsValid && strengthValue >= 80)){
      //
    }
  }
  

  return (
    <>
      <form action="">
        
        <h1>Les Vues</h1>
        
        <input 
          type='email' 
          className="email-input"
          style={{  
            border: `1px solid ${EmailBorderColor}`,
            outline: emailFieldOutline,
          }}
          placeholder='E-mail'
          onChange={(e)=>setEmailChecker(e.target.value)}
          onFocus={(e)=>setEmailFieldOutline("none")}
        />

        <input 
          type='password' 
          className="password-input"
          placeholder='Password' 
          value={passwordChecker}
          style={{
            border: `1px solid ${PasswordBorderColor}`
          }}
          onChange={(e)=>setPasswordChecker(e.target.value)}
          onFocus={(e)=>setPasswordStrengthVisibility("flex")}
          onBlur={(e)=>setPasswordStrengthVisibility("none")}
        />
          
        <div 
          className="password-strength"
          style={{
            display: PasswordStrengthVisibility,
          }}
        >
          <span 
            className="strength-label"
            style={{
              color: `hsl(${hue}, 100%, 50%)`,
            }}
          >
            {verbalStrengthValue}
          </span>
          <progress 
            value={strengthValue} 
            max="100" 
            className="strength-progress"
            style={{
              accentColor: `hsl(${hue}, 100%, 50%)`
            }}
          />
        </div>

        <p>Already signed up? <Link to="/signin">Sign in</Link></p>
        <button type='submit'
          onClick={handleSubmit}>Submit</button>
      </form>
    </>
  )
}

export default App