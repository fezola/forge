import React, { useState, useCallback, useMemo } from 'react';

export type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'magic-link';

export interface ForgeAuthProps {
  mode?: AuthMode;
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showGoogle?: boolean;
  showGitHub?: boolean;
  showApple?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showTerms?: boolean;
  showConfirmPassword?: boolean;
  buttonText?: string;
  borderRadius?: number;
  width?: number;
  theme?: 'light' | 'dark';
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
  onModeChange?: (mode: AuthMode) => void;
}

type FieldErrors = Record<string, string>;

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

const providerIcons: Record<string, React.ReactNode> = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  ),
};

const modeConfig: Record<AuthMode, { title: string; subtitle: string; showEmail: boolean; showPassword: boolean; showName: boolean; showConfirmPassword: boolean; buttonText: string; footerText: string; footerAction: AuthMode; footerActionText: string }> = {
  'signin': {
    title: 'Welcome back',
    subtitle: 'Sign in to your account to continue.',
    showEmail: true,
    showPassword: true,
    showName: false,
    showConfirmPassword: false,
    buttonText: 'Sign in',
    footerText: "Don't have an account?",
    footerAction: 'signup',
    footerActionText: 'Create one',
  },
  'signup': {
    title: 'Create your account',
    subtitle: 'Get started with a free account.',
    showEmail: true,
    showPassword: true,
    showName: true,
    showConfirmPassword: true,
    buttonText: 'Create account',
    footerText: 'Already have an account?',
    footerAction: 'signin',
    footerActionText: 'Sign in',
  },
  'forgot-password': {
    title: 'Reset your password',
    subtitle: "Enter your email and we'll send you a reset link.",
    showEmail: true,
    showPassword: false,
    showName: false,
    showConfirmPassword: false,
    buttonText: 'Send reset link',
    footerText: 'Remember your password?',
    footerAction: 'signin',
    footerActionText: 'Sign in',
  },
  'reset-password': {
    title: 'Set new password',
    subtitle: 'Enter your new password below.',
    showEmail: false,
    showPassword: true,
    showName: false,
    showConfirmPassword: true,
    buttonText: 'Reset password',
    footerText: '',
    footerAction: 'signin',
    footerActionText: 'Back to sign in',
  },
  'verify-email': {
    title: 'Check your email',
    subtitle: "We've sent a verification link to your email address.",
    showEmail: false,
    showPassword: false,
    showName: false,
    showConfirmPassword: false,
    buttonText: 'Resend email',
    footerText: 'Wrong email?',
    footerAction: 'signup',
    footerActionText: 'Go back',
  },
  'magic-link': {
    title: 'Magic link',
    subtitle: 'Enter your email to receive a sign-in link.',
    showEmail: true,
    showPassword: false,
    showName: false,
    showConfirmPassword: false,
    buttonText: 'Send magic link',
    footerText: 'Prefer password?',
    footerAction: 'signin',
    footerActionText: 'Sign in',
  },
};

export function ForgeAuth({
  mode: initialMode = 'signin',
  logo,
  title: titleOverride,
  subtitle: subtitleOverride,
  showGoogle = true,
  showGitHub = true,
  showApple = false,
  showRememberMe = true,
  showForgotPassword = true,
  showTerms = false,
  showConfirmPassword: showConfirmPasswordOverride,
  buttonText: buttonTextOverride,
  borderRadius = 12,
  width = 400,
  theme = 'light',
  onSuccess,
  onError,
  onModeChange,
}: ForgeAuthProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [globalError, setGlobalError] = useState<string | null>(null);

  const config = modeConfig[mode];
  const showConfirmPasswordField = showConfirmPasswordOverride !== undefined ? showConfirmPasswordOverride : config.showConfirmPassword;

  const handleModeChange = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setTouched(new Set());
    setGlobalError(null);
    setSuccess(false);
    setPassword('');
    setConfirmPassword('');
    onModeChange?.(newMode);
  }, [onModeChange]);

  const validate = useCallback((): FieldErrors => {
    const errs: FieldErrors = {};
    if (config.showName && !name.trim()) errs.name = 'Name is required';
    if (config.showEmail && email) {
      const emailErr = validateEmail(email);
      if (emailErr) errs.email = emailErr;
    } else if (config.showEmail && !email) {
      errs.email = 'Email is required';
    }
    if (config.showPassword) {
      const pwErr = validatePassword(password);
      if (pwErr) errs.password = pwErr;
    }
    if (showConfirmPasswordField && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (showTerms && !agreedToTerms) {
      errs.terms = 'You must agree to the terms';
    }
    return errs;
  }, [config, name, email, password, confirmPassword, showConfirmPasswordField, showTerms, agreedToTerms]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field));
    setErrors(validate());
  }, [validate]);

  const handleSubmit = useCallback(async () => {
    const errs = validate();
    setErrors(errs);
    setGlobalError(null);

    const allFields: string[] = [];
    if (config.showName) allFields.push('name');
    if (config.showEmail) allFields.push('email');
    if (config.showPassword) allFields.push('password');
    if (showConfirmPasswordField) allFields.push('confirmPassword');
    setTouched(new Set(allFields));

    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (mode === 'signin' && showForgotPassword) {
        onSuccess?.({ email, rememberMe });
      } else if (mode === 'signup') {
        onSuccess?.({ name, email });
      } else if (mode === 'forgot-password' || mode === 'magic-link') {
        setSuccess(true);
        onSuccess?.({ email });
      } else if (mode === 'reset-password') {
        setSuccess(true);
        onSuccess?.({});
      } else if (mode === 'verify-email') {
        setSuccess(true);
        onSuccess?.({});
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Something went wrong');
      setGlobalError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [validate, config, mode, email, password, rememberMe, name, showForgotPassword, showConfirmPasswordField, onSuccess, onError]);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const pct = Math.min(100, (score / 6) * 100);
    if (pct < 33) return { score: pct, label: 'Weak', color: '#ef4444' };
    if (pct < 66) return { score: pct, label: 'Fair', color: '#f59e0b' };
    return { score: pct, label: 'Strong', color: '#22c55e' };
  }, [password]);

  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0b' : '#ffffff';
  const text = isDark ? '#fafafa' : '#111111';
  const muted = isDark ? '#71717a' : '#a1a1aa';
  const border = isDark ? '#27272a' : '#e4e4e7';
  const inputBg = isDark ? '#18181b' : '#fafafa';
  const hoverBg = isDark ? '#27272a' : '#f4f4f5';
  const cardBorder = isDark ? '#27272a' : '#e4e4e7';
  const dividerText = isDark ? '#52525b' : '#d4d4d8';

  const inputShared: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: `1px solid ${border}`,
    borderRadius: borderRadius - 2,
    fontSize: 14,
    color: text,
    background: inputBg,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const labelShared: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: text,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        width: '100%',
        maxWidth: width,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: bg,
          border: `1px solid ${cardBorder}`,
          borderRadius,
          padding: '32px 28px',
          boxShadow: isDark
            ? '0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        {logo !== undefined ? (
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>{logo}</div>
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isDark ? '#fafafa' : '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#111' : '#fff',
              fontSize: 18,
              fontWeight: 700,
              margin: '0 auto 24px',
              letterSpacing: '-0.03em',
            }}
          >
            F
          </div>
        )}

        {/* Title + Subtitle */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 650, color: text, letterSpacing: '-0.02em' }}>
            {titleOverride || config.title}
          </div>
          <div style={{ fontSize: 14, color: muted, marginTop: 6, lineHeight: '20px' }}>
            {subtitleOverride || config.subtitle}
          </div>
        </div>

        {/* Success state */}
        {success && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#fff',
                fontSize: 24,
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: text }}>
              {mode === 'forgot-password' || mode === 'magic-link'
                ? 'Email sent'
                : mode === 'verify-email'
                ? 'Verification sent'
                : mode === 'signup'
                ? 'Account created'
                : 'Password reset'}
            </div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4, lineHeight: '18px' }}>
              {mode === 'forgot-password' || mode === 'magic-link'
                ? 'Check your inbox for the link.'
                : mode === 'verify-email'
                ? 'Please check your email to verify your account.'
                : mode === 'signup'
                ? 'Welcome aboard! Check your email to verify.'
                : 'Your password has been updated.'}
            </div>
            {mode !== 'signin' && mode !== 'signup' && (
              <button
                onClick={() => handleModeChange('signin')}
                style={{
                  marginTop: 20,
                  padding: '8px 20px',
                  borderRadius: borderRadius - 2,
                  background: isDark ? '#27272a' : '#f4f4f5',
                  color: text,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Back to sign in
              </button>
            )}
          </div>
        )}

        {!success && (
          <>
            {/* Social providers */}
            {(showGoogle || showGitHub || showApple) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {showGoogle && (
                  <ProviderButton label="Continue with Google" provider="google" disabled={loading} isDark={isDark} border={border} hoverBg={hoverBg} text={text} borderRadius={borderRadius} />
                )}
                {showGitHub && (
                  <ProviderButton label="Continue with GitHub" provider="github" disabled={loading} isDark={isDark} border={border} hoverBg={hoverBg} text={text} borderRadius={borderRadius} />
                )}
                {showApple && (
                  <ProviderButton label="Continue with Apple" provider="apple" disabled={loading} isDark={isDark} border={border} hoverBg={hoverBg} text={text} borderRadius={borderRadius} />
                )}
              </div>
            )}

            {/* Divider */}
            {(showGoogle || showGitHub || showApple) && (config.showEmail || config.showPassword) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: border }} />
                <span style={{ fontSize: 12, color: dividerText, fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: border }} />
              </div>
            )}

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name field */}
              {config.showName && (
                <div>
                  <label style={labelShared}>Full name</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: muted, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Jane Doe"
                      disabled={loading}
                      style={{
                        ...inputShared,
                        borderColor: errors.name && touched.has('name') ? '#ef4444' : border,
                        opacity: loading ? 0.5 : 1,
                      }}
                    />
                  </div>
                  {errors.name && touched.has('name') && (
                    <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.name}</span>
                  )}
                </div>
              )}

              {/* Email field */}
              {config.showEmail && (
                <div>
                  <label style={labelShared}>Email address</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: muted, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="jane@example.com"
                      type="email"
                      autoComplete={mode === 'signin' ? 'email' : 'email'}
                      disabled={loading}
                      style={{
                        ...inputShared,
                        borderColor: errors.email && touched.has('email') ? '#ef4444' : border,
                        opacity: loading ? 0.5 : 1,
                      }}
                    />
                  </div>
                  {errors.email && touched.has('email') && (
                    <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.email}</span>
                  )}
                </div>
              )}

              {/* Password field */}
              {config.showPassword && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelShared, marginBottom: 0 }}>Password</label>
                    {mode === 'signin' && showForgotPassword && (
                      <button
                        onClick={() => handleModeChange('forgot-password')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12.5,
                          color: '#6366f1',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 500,
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: muted, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      disabled={loading}
                      style={{
                        ...inputShared,
                        paddingRight: 40,
                        borderColor: errors.password && touched.has('password') ? '#ef4444' : border,
                        opacity: loading ? 0.5 : 1,
                      }}
                    />
                    <button
                      onClick={() => setShowPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 4,
                        cursor: 'pointer',
                        color: muted,
                        display: 'flex',
                        fontFamily: 'inherit',
                      }}
                    >
                      {showPassword ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && touched.has('password') && (
                    <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.password}</span>
                  )}

                  {/* Password strength */}
                  {mode === 'signup' && password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 2,
                            background: border,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${passwordStrength.score}%`,
                              height: '100%',
                              background: passwordStrength.color,
                              borderRadius: 2,
                              transition: 'width 0.3s, background 0.3s',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: passwordStrength.color, fontWeight: 500, minWidth: 36, textAlign: 'right' }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password field */}
              {showConfirmPasswordField && (
                <div>
                  <label style={labelShared}>Confirm password</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: muted, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter your password"
                      type="password"
                      autoComplete="new-password"
                      disabled={loading}
                      style={{
                        ...inputShared,
                        borderColor: errors.confirmPassword && touched.has('confirmPassword') ? '#ef4444' : border,
                        opacity: loading ? 0.5 : 1,
                      }}
                    />
                  </div>
                  {errors.confirmPassword && touched.has('confirmPassword') && (
                    <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.confirmPassword}</span>
                  )}
                </div>
              )}
            </div>

            {/* Remember me + Terms */}
            <div style={{ marginTop: 16 }}>
              {mode === 'signin' && showRememberMe && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: muted }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#111', width: 15, height: 15, cursor: 'pointer', borderRadius: 3 }}
                  />
                  Remember me
                </label>
              )}
              {mode === 'signup' && showTerms && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 13, color: muted }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      style={{ accentColor: '#111', width: 15, height: 15, cursor: 'pointer', marginTop: 1, borderRadius: 3 }}
                    />
                    <span>
                      I agree to the{' '}
                      <span style={{ color: '#6366f1', textDecoration: 'none', cursor: 'pointer' }}>Terms of Service</span>{' '}
                      and{' '}
                      <span style={{ color: '#6366f1', textDecoration: 'none', cursor: 'pointer' }}>Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.terms && touched.has('terms') && (
                    <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.terms}</span>
                  )}
                </div>
              )}
            </div>

            {/* Global error */}
            {globalError && (
              <div
                style={{
                  marginTop: 16,
                  padding: '8px 12px',
                  borderRadius: borderRadius - 4,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: 12.5,
                  lineHeight: '18px',
                }}
              >
                {globalError}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '10px 0',
                borderRadius: borderRadius - 2,
                background: loading ? '#6b7280' : '#111',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 590,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
                lineHeight: '20px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#333'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#111'; }}
            >
              {loading && <Spinner />}
              {loading
                ? mode === 'signin'
                  ? 'Signing in…'
                  : mode === 'signup'
                  ? 'Creating account…'
                  : mode === 'forgot-password'
                  ? 'Sending…'
                  : mode === 'reset-password'
                  ? 'Resetting…'
                  : 'Sending…'
                : buttonTextOverride || config.buttonText}
            </button>

            {/* Footer */}
            {config.footerText && (
              <div
                style={{
                  marginTop: 20,
                  textAlign: 'center',
                  fontSize: 13,
                  color: muted,
                }}
              >
                {config.footerText}{' '}
                <button
                  onClick={() => handleModeChange(config.footerAction)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#6366f1',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                  }}
                >
                  {config.footerActionText}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProviderButton({
  label,
  provider,
  disabled,
  isDark,
  border,
  hoverBg,
  text,
  borderRadius,
}: {
  label: string;
  provider: string;
  disabled: boolean;
  isDark: boolean;
  border: string;
  hoverBg: string;
  text: string;
  borderRadius: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '9px 0',
        borderRadius: borderRadius - 2,
        background: hover && !disabled ? hoverBg : 'transparent',
        border: `1px solid ${border}`,
        color: text,
        fontSize: 13.5,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'background 0.12s',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {providerIcons[provider]}
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'forge-spin 0.6s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}
