import { useState } from 'react'
import AuthForm from '../Components/AuthForm'
import './signup.css'

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
  } else {
    var emailIsValid = true
    return {emailIsValid}
  }
}

function signup() {
  const [passwordChecker, setPasswordChecker] = useState("")
  const [emailChecker, setEmailChecker] = useState("")
  const [emailFieldOutline, setEmailFieldOutline] = useState("none")
  const [PasswordStrengthVisibility, setPasswordStrengthVisibility] = useState("none")
  
  // Call the function
  const { strengthValue, verbalStrengthValue, hue } = calculatePasswordStrength(passwordChecker)
  const { emailIsValid } = checkEmail(emailChecker)
  
  const [EmailBorderColor, setEmailBorderColor] = useState("transparent")
  const [PasswordBorderColor, setPasswordBorderColor] = useState("transparent")
  
  const handleSubmit = async (e) => {
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
    } else {
      try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailChecker,
            password: passwordChecker
          })
        })

        const data = await response.json()
        console.log("Backend response:", data)
      }catch(error){
        console.error('Error sending to backend:', error)
      };
    }
  }
  
  return (
    <AuthForm
      onSubmit={handleSubmit}
      emailValue={emailChecker}
      onEmailChange={setEmailChecker}
      emailBorderColor={EmailBorderColor}
      emailOutline={emailFieldOutline}
      onEmailFocus={() => setEmailFieldOutline("none")}
      passwordValue={passwordChecker}
      onPasswordChange={setPasswordChecker}
      passwordBorderColor={PasswordBorderColor}
      onPasswordFocus={() => setPasswordStrengthVisibility("flex")}
      onPasswordBlur={() => setPasswordStrengthVisibility("none")}
      showStrengthMeter={true}
      strengthVisibility={PasswordStrengthVisibility}
      hue={hue}
      verbalStrengthValue={verbalStrengthValue}
      strengthValue={strengthValue}
      footerText="Already signed up?"
      footerLinkText="Sign in"
      footerLinkTo="/signin"
      submitButtonText="Submit"
    />
  )
}

export default signup