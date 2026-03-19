import { Link } from 'react-router-dom'

export default function AuthForm({
  onSubmit,
  emailValue,
  onEmailChange,
  emailBorderColor,
  emailOutline = "initial",
  onEmailFocus,
  passwordValue,
  onPasswordChange,
  passwordBorderColor,
  onPasswordFocus,
  onPasswordBlur,
  showStrengthMeter = false,
  strengthVisibility = "none",
  hue = 0,
  verbalStrengthValue = "",
  strengthValue = 0,
  footerText,
  footerLinkText,
  footerLinkTo,
  submitButtonText,
  children
}) {
  return (
    <form 
      onSubmit={onSubmit}
      noValidate
      autoComplete='off'
    >
      <h1>Les Vues</h1>
      
      <input 
        className="email-input"
        style={{  
          border: `1px solid ${emailBorderColor}`,
          outline: emailOutline,
        }}
        placeholder='E-mail'
        value={emailValue}
        onChange={(e) => onEmailChange(e.target.value)}
        onFocus={onEmailFocus}
      />

      <input 
        type='password' 
        className="password-input"
        placeholder='Password' 
        value={passwordValue}
        style={{
          border: `1px solid ${passwordBorderColor}`
        }}
        onChange={(e) => onPasswordChange(e.target.value)}
        onFocus={onPasswordFocus}
        onBlur={onPasswordBlur}
      />
        
      {showStrengthMeter && (
        <div 
          className="password-strength"
          style={{
            display: strengthVisibility,
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
      )}

      <p>{footerText} <Link to={footerLinkTo}>{footerLinkText}</Link></p>
      <button type='submit'>{submitButtonText}</button>

      {/* Renders any extra elements passed into the component (like Forgot Password) */}
      {children}
    </form>
  )
}