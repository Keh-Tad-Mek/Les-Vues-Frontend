import { Link } from 'react-router-dom'
import authStyles from './AuthForm.module.css' // Import the new module

export default function AuthForm({
  onSubmit, emailValue, onEmailChange, emailBorderColor, displayOTPField = "none",
  emailOutline = "initial", onEmailFocus, passwordValue, onPasswordChange,
  passwordBorderColor, onPasswordFocus, onPasswordBlur, showStrengthMeter = false,
  strengthVisibility = "none", hue = 0, verbalStrengthValue = "", strengthValue = 0,
  footerText, footerLinkText, footerLinkTo, submitButtonText, otpValue, onOtpChange,
  onVerifyOtp, onCloseOtp, children
}) {
  return (
    <div>
      {/* OTP Popup Overlay */}
      <div className={authStyles.otpPopup} style={{ display: displayOTPField }}>
        <div className={authStyles.otpContent} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
            <div style={{ width: '24px' }}></div>
            <h2 style={{ color: 'var(--header-color)', margin: 0, flex: 1, textAlign: 'center' }}>Verify Email</h2>
            <button type="button" onClick={onCloseOtp} style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: 'var(--header-color)', lineHeight: '1', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>&times;</button>
          </div>
          <p style={{ margin: '0 0 20px 0' }}>We sent a code to {emailValue}</p>
          <input
            type="text"
            placeholder='Enter 6-digit code'
            value={otpValue}
            onChange={(e) => onOtpChange(e.target.value)}
            className={authStyles.inputField} 
            maxLength={6}
          />
          <button type="button" className={authStyles.submitBtn} onClick={onVerifyOtp}>
            Verify & Sign up
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate autoComplete='off' className={authStyles.formContainer}>
        <h1>Les Vues</h1>

        <input
          className={authStyles.inputField}
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
          className={authStyles.inputField}
          placeholder='Password'
          value={passwordValue}
          style={{ border: `1px solid ${passwordBorderColor}` }}
          onChange={(e) => onPasswordChange(e.target.value)}
          onFocus={onPasswordFocus}
          onBlur={onPasswordBlur}
        />

        {showStrengthMeter && (
          <div className={authStyles.passwordStrength} style={{ display: strengthVisibility }}>
            <span className={authStyles.strengthLabel} style={{ color: `hsl(${hue}, 100%, 50%)` }}>
              {verbalStrengthValue}
            </span>
            <progress value={strengthValue} max="100" className="strength-progress" style={{ accentColor: `hsl(${hue}, 100%, 50%)` }} />
          </div>
        )}

        <p>{footerText} <Link to={footerLinkTo}>{footerLinkText}</Link></p>
        <button className={authStyles.submitBtn} type='submit'>{submitButtonText}</button>

        {children}
      </form>
    </div>
  )
}