
import { useState } from "react";
import type { FormEvent } from "react";

import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  User,
  CheckSquare,
  Target,
  HeartPulse,
  CalendarDays,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import { GoogleLogin } from "@react-oauth/google";
import api from "./services/api";
import "./Login.css";

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const saveToken = (token: string) => {
    localStorage.setItem("access_token", token);
    onLoginSuccess();
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await api.post("/auth/register", {
          full_name: fullName,
          email,
          password,
        });
      }

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      saveToken(response.data.access_token);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/google", {
        credential,
      });

      saveToken(response.data.access_token);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup((current) => !current);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <main className="lifeos-auth-page">
      {/* CINEMATIC BACKGROUND */}
      <div className="auth-background" aria-hidden="true">
        <div className="auth-aurora auth-aurora-one" />
        <div className="auth-aurora auth-aurora-two" />
        <div className="auth-aurora auth-aurora-three" />

        <div className="auth-grid-pattern" />

        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />

        <div className="auth-particles">
          {Array.from({ length: 30 }).map((_, index) => (
            <span
              key={index}
              className={`auth-particle particle-${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="auth-header">
        <div className="auth-header-brand">
          <div className="auth-brand-icon">
            <BrainCircuit size={27} strokeWidth={2} />
          </div>

          <span>
            Life<span className="auth-brand-highlight">OS</span>
          </span>
        </div>

        <nav className="auth-navigation">
          <span>PLAN</span>
          <i>•</i>
          <span>FOCUS</span>
          <i>•</i>
          <span>ACHIEVE</span>
        </nav>

        <div className="auth-header-status">
          <span className="auth-status-dot" />
          YOUR PERSONAL OS
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="auth-main">
        {/* LEFT HERO */}
        <section className="auth-hero">
          <div className="auth-hero-label">
            <Sparkles size={15} />
            <span>YOUR LIFE. YOUR SYSTEM.</span>
          </div>

          <h1>
            Take control
            <br />
            of your <span>potential.</span>
          </h1>

          <div className="auth-hero-underline" />

          <p className="hero-description">
            Your goals deserve more than scattered notes.
            Bring your tasks, habits, routines and personal
            growth together in one intelligent space.
          </p>

          {/* FEATURE CHIPS */}
          <div className="hero-features">
            <div className="hero-feature">
              <div className="feature-icon purple">
                <CheckSquare size={18} />
              </div>
              <span>Smart Tasks</span>
            </div>

            <div className="hero-feature">
              <div className="feature-icon blue">
                <Target size={18} />
              </div>
              <span>Goal Tracking</span>
            </div>

            <div className="hero-feature">
              <div className="feature-icon pink">
                <HeartPulse size={18} />
              </div>
              <span>Habit Builder</span>
            </div>

            <div className="hero-feature">
              <div className="feature-icon orange">
                <CalendarDays size={18} />
              </div>
              <span>Life Analytics</span>
            </div>
          </div>

          {/* FLOATING PRODUCTIVITY CARD */}
          <div className="hero-floating-card floating-task">
            <div className="floating-card-icon">
              <CheckSquare size={21} />
            </div>

            <div className="floating-card-copy">
              <span>DAILY PRODUCTIVITY</span>
              <strong>Make progress every day</strong>
            </div>

            <Sparkles size={17} className="floating-sparkle" />
          </div>

          {/* FLOATING GROWTH CARD */}
          <div className="hero-floating-card floating-chart">
            <div className="floating-card-icon chart-icon">
              <ChartNoAxesColumnIncreasing size={22} />
            </div>

            <div className="floating-card-copy">
              <span>PERSONAL GROWTH</span>
              <strong>Small steps. Big results.</strong>
            </div>

            <ArrowRight size={16} className="floating-sparkle" />
          </div>

          {/* HERO BOTTOM */}
          <div className="auth-hero-bottom">
            <div className="auth-mini-avatars">
              <span>L</span>
              <span>O</span>
              <span>S</span>
            </div>

            <p>
              <strong>One space.</strong> Endless possibilities.
            </p>
          </div>
        </section>

        {/* LOGIN CARD */}
        <section className="auth-card">
          <div className="auth-card-border" />

          <div className="auth-card-content">
            {/* CARD BRAND */}
            <div className="auth-card-brand">
              <div className="auth-card-brand-icon">
                <BrainCircuit size={32} strokeWidth={2} />
              </div>

              <span>
                Life<span>OS</span>
              </span>
            </div>

            {/* CARD HEADING */}
            <div className="auth-card-heading">
              <div className="auth-welcome-label">
                <span className="auth-welcome-dot" />
                {isSignup
                  ? "YOUR JOURNEY STARTS HERE"
                  : "WELCOME BACK"}
              </div>

              <h2>
                {isSignup
                  ? "Create your account."
                  : "Your next chapter starts here."}
              </h2>

              <p>
                {isSignup
                  ? "Create your personal space and start growing."
                  : "Sign in to continue your journey."}
              </p>
            </div>

            {/* GOOGLE AUTH */}
            <div className="auth-google-button">
              <GoogleLogin
                onSuccess={(response) => {
                  if (response.credential) {
                    handleGoogleSuccess(response.credential);
                  } else {
                    setError(
                      "Google did not return a valid credential."
                    );
                  }
                }}
                onError={() =>
                  setError("Google sign-in was unsuccessful.")
                }
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="400"
              />
            </div>

            {/* DIVIDER */}
            <div className="auth-divider">
              <span />
              <p>OR CONTINUE WITH EMAIL</p>
              <span />
            </div>

            {/* EMAIL FORM */}
            <form className="auth-form" onSubmit={handleLogin}>
              {isSignup && (
                <div className="auth-field">
                  <label htmlFor="auth-full-name">FULL NAME</label>

                  <div className="auth-input-wrapper">
                    <User size={19} />

                    <input
                      id="auth-full-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">EMAIL ADDRESS</label>

                <div className="auth-input-wrapper">
                  <Mail size={19} />

                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">PASSWORD</label>

                <div className="auth-input-wrapper">
                  <Lock size={19} />

                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={isSignup ? 8 : undefined}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : isSignup
                      ? "Create my account"
                      : "Sign in to LifeOS"}
                </span>

                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <ArrowRight size={20} />
                )}
              </button>
            </form>

            {/* SIGNUP SWITCH */}
            <div className="auth-signup">
              <span>
                {isSignup
                  ? "Already have an account?"
                  : "New to LifeOS?"}
              </span>

              <button type="button" onClick={switchMode}>
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </div>

            {/* SECURITY */}
            <div className="auth-security">
              <ShieldCheck size={16} />
              <span>
                Your personal space. Your data. Your control.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="auth-footer">
        <span>© 2026 LIFEOS</span>

        <span className="auth-footer-center">
          Designed for intentional living
          <Zap size={13} />
        </span>

        <span>PLAN · FOCUS · ACHIEVE</span>
      </footer>
    </main>
  );
}

export default Login;
