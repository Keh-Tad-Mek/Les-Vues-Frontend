import { Link } from 'react-router-dom'

export default function AuthForm({
  onSubmit,
  emailValue,
  onEmailChange,
  emailBorderColor,
  displayOTPField = "none",
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
  otpValue,
  onOtpChange,
  onVerifyOtp,
  onCloseOtp, // New prop to handle closing the popup
  children
}) {
  return (
    <div>
      {/* OTP Popup Overlay */}
      <div className='otp-popup' style={{ display: displayOTPField }}>
        <div className='otp-content' style={{ position: 'relative' }}>
          {/* Close Button */}
          <div className='otp-header' style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '10px'
          }}>
            {/* 1. Invisible spacer to push text to the center */}
            <div style={{ width: '24px' }}></div>

            {/* 2. The Title */}
            <h2 style={{
              color: 'var(--header-color)',
              margin: 0,
              flex: 1,
              textAlign: 'center'
            }}>
              Verify Email
            </h2>

            {/* 3. The Button */}
            <button
              type="button"
              className="close-otp"
              onClick={onCloseOtp}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '32px', // Slightly larger for better UX
                cursor: 'pointer',
                color: 'var(--header-color)',
                lineHeight: '1',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px' // Matches the spacer width for perfect centering
              }}
            >
              &times;
            </button>
          </div>
          <p style={{ margin: '0 0 20px 0' }}>We sent a code to {emailValue}</p>
          <input
            type="text"
            placeholder='Enter 6-digit code'
            value={otpValue}
            onChange={(e) => onOtpChange(e.target.value)}
            className="email-input"
            maxLength={6}
          />
          <button
            type="button"
            className='send-code'
            onClick={onVerifyOtp}
          >
            Verify & Sign up
          </button>
        </div>
      </div>

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
            style={{ display: strengthVisibility }}
          >
            <span
              className="strength-label"
              style={{ color: `hsl(${hue}, 100%, 50%)` }}
            >
              {verbalStrengthValue}
            </span>
            <progress
              value={strengthValue}
              max="100"
              className="strength-progress"
              style={{ accentColor: `hsl(${hue}, 100%, 50%)` }}
            />
          </div>
        )}

        <p>{footerText} <Link to={footerLinkTo}>{footerLinkText}</Link></p>
        <button type='submit'>{submitButtonText}</button>

        {children}
      </form>
    </div>
  )
}