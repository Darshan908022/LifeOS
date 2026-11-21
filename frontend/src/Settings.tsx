
import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  FormEvent,
} from "react";

import {
  User,
  Palette,
  ShieldCheck,
  Bell,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Save,
  Settings as SettingsIcon,
  Mail,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

import api from "./services/api";

// USER PROFILE
interface UserProfile {
  id?: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
  avatar_url?: string;
}

// SETTINGS PROPS
interface SettingsProps {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
}

const Settings = ({
  theme,
  setTheme,
  profile = {},
  setProfile,
}: SettingsProps) => {
  // PROFILE STATE
  const [displayName, setDisplayName] = useState(
    profile.full_name || profile.name || ""
  );

  const [profileImage, setProfileImage] = useState(
    profile.profile_image || profile.avatar_url || ""
  );

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // PREFERENCE STATE
  const [notifications, setNotifications] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // PASSWORD STATE
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // FEEDBACK STATE
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  // SYNC PROFILE WITH APP STATE
  useEffect(() => {
    setDisplayName(profile.full_name || profile.name || "");

    setProfileImage(
      profile.profile_image || profile.avatar_url || ""
    );
  }, [
    profile.full_name,
    profile.name,
    profile.profile_image,
    profile.avatar_url,
  ]);

  // LOAD PREFERENCES FROM BACKEND
  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const response = await api.get("/auth/preferences");

        if (!isMounted) return;

        const savedTheme = response.data.theme_preference;
        const savedNotifications = response.data.notifications_enabled;

        if (["light", "dark", "system"].includes(savedTheme)) {
          setTheme(savedTheme);
          localStorage.setItem("lifeos_theme", savedTheme);
        }

        setNotifications(Boolean(savedNotifications));

        localStorage.setItem(
          "lifeos_notifications",
          String(Boolean(savedNotifications))
        );
      } catch (error) {
        console.error("Unable to load preferences:", error);

        if (isMounted) {
          setNotifications(
            localStorage.getItem("lifeos_notifications") !== "false"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [setTheme]);

  // UPLOAD PROFILE PHOTO
  const handlePhotoUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Please choose an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setMessage("Photo preview updated. Save your profile to apply it.");
      }
    };

    reader.onerror = () => {
      setUploadError("Unable to read this image. Please try again.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // SAVE PROFILE TO BACKEND
  const saveProfile = async () => {
    const trimmedName = displayName.trim();

    if (trimmedName.length < 2) {
      setMessage("Your name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setMessage("Your name cannot exceed 100 characters.");
      return;
    }

    setIsSavingProfile(true);
    setMessage("");
    setUploadError("");

    try {
      const response = await api.put("/auth/me", {
        full_name: trimmedName,
        profile_image: profileImage || null,
      });

      const updatedProfile = response.data;

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...updatedProfile,
        name: updatedProfile.full_name,
        full_name: updatedProfile.full_name,
        profile_image: updatedProfile.profile_image,
        avatar_url: updatedProfile.profile_image || undefined,
      }));

      setDisplayName(updatedProfile.full_name);
      setProfileImage(updatedProfile.profile_image || "");

      setMessage("Your profile has been saved successfully!");
    } catch (error) {
      console.error("Unable to save profile:", error);

      setMessage(
        "Unable to save your profile. Please check your connection and try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  // REMOVE PROFILE PHOTO
  const removePhoto = () => {
    setProfileImage("");
    setMessage("Photo removed from preview. Save your profile to apply it.");
  };

  // SAVE PREFERENCES TO BACKEND
  const savePreferences = async () => {
    setIsSavingPreferences(true);
    setMessage("");

    try {
      const response = await api.put("/auth/preferences", {
        theme_preference: theme,
        notifications_enabled: notifications,
      });

      localStorage.setItem(
        "lifeos_theme",
        response.data.theme_preference
      );

      localStorage.setItem(
        "lifeos_notifications",
        String(response.data.notifications_enabled)
      );

      setMessage("Your preferences have been saved successfully!");
    } catch (error) {
      console.error("Unable to save preferences:", error);

      setMessage(
        "Unable to save your preferences. Please check your connection and try again."
      );
    } finally {
      setIsSavingPreferences(false);
      window.setTimeout(() => setMessage(""), 3000);
    }
  };

  // PASSWORD STRENGTH
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return Math.min(score, 5);
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const passwordStrengthLabel = [
    "",
    "Very weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ][passwordStrength];

  // CHANGE PASSWORD
  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword.length > 128) {
      setPasswordError("Your new password cannot exceed 128 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully. Please log in again."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      // The backend increments token_version.
      // The current access token is now invalid.
      // Show the success message before logging out.
      window.setTimeout(() => {
        localStorage.removeItem("access_token");
        window.location.reload();
      }, 1800);
    } catch (error: any) {
      console.error("Unable to change password:", error);

      const detail = error.response?.data?.detail;

      setPasswordError(
        typeof detail === "string"
          ? detail
          : "Unable to change your password. Please check your current password and try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out of LifeOS?"
    );

    if (confirmed) {
      localStorage.removeItem("access_token");
      window.location.reload();
    }
  };

  // USER DISPLAY INFORMATION
  const userName =
    displayName ||
    profile.full_name ||
    profile.name ||
    "LifeOS User";

  const userInitial = userName.charAt(0).toUpperCase();

  // PASSWORD FIELD STYLE
  const passwordInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 48px 13px 14px",
    borderRadius: "10px",
    border: "1px solid var(--border-color, #e5e7eb)",
    background: "var(--card-bg, transparent)",
    color: "var(--text-primary, inherit)",
    fontSize: "14px",
    outline: "none",
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "var(--text-secondary, #888)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  };

  return (
    <div className="settings-page">

      {/* HEADER */}
      <section className="settings-header">
        <div>
          <span className="settings-eyebrow">
            PERSONALIZE YOUR WORKSPACE
          </span>

          <h1>Settings</h1>

          <p>
            Manage your profile, preferences and LifeOS experience.
          </p>
        </div>

        <div className="settings-header-icon">
          <SettingsIcon size={27} />
        </div>
      </section>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="settings-success">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* PERSONAL PROFILE */}
      <section className="settings-card">

        <div className="settings-card-heading">
          <div className="settings-icon purple">
            <User size={21} />
          </div>

          <div>
            <h2>Personal Profile</h2>
            <p>Customize how you appear in LifeOS</p>
          </div>
        </div>

        <div className="settings-profile settings-profile-upgraded">

          <div className="settings-large-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Your profile" />
            ) : (
              <span>{userInitial}</span>
            )}

            <div className="settings-camera-badge">
              <Camera size={16} />
            </div>
          </div>

          <div className="settings-profile-details">
            <strong>{userName}</strong>

            <span>
              {profile.email || "Email not available"}
            </span>

            <div className="settings-photo-actions">

              <label
                htmlFor="lifeos-profile-photo"
                className="settings-upload-button"
              >
                <Upload size={15} />
                Upload photo
              </label>

              <input
                id="lifeos-profile-photo"
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
              />

              {profileImage && (
                <button
                  type="button"
                  className="settings-remove-photo"
                  onClick={removePhoto}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              )}

            </div>
          </div>
        </div>

        {uploadError && (
          <p className="settings-error">{uploadError}</p>
        )}

        <div className="settings-field">
          <label>Display Name</label>

          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your display name"
            maxLength={100}
          />

          <small>
            Your name will appear throughout your LifeOS workspace.
          </small>
        </div>

        <div className="settings-field">
          <label>Email Address</label>

          <div className="settings-input-with-icon">
            <Mail size={17} />

            <input
              type="email"
              value={profile.email || ""}
              readOnly
              placeholder="Your account email"
            />
          </div>

          <small>Your registered account email.</small>
        </div>

        <button
          type="button"
          className="settings-save-button settings-profile-save"
          onClick={saveProfile}
          disabled={isSavingProfile}
        >
          <Save size={17} />
          {isSavingProfile ? "Saving..." : "Save Profile"}
        </button>

      </section>

      {/* APPEARANCE */}
      <section className="settings-card">

        <div className="settings-card-heading">
          <div className="settings-icon blue">
            <Palette size={21} />
          </div>

          <div>
            <h2>Appearance</h2>
            <p>Choose the look and feel of your workspace</p>
          </div>
        </div>

        <div className="settings-theme-grid">

          <button
            type="button"
            className={`settings-theme-option ${
              theme === "light" ? "selected" : ""
            }`}
            onClick={() => setTheme("light")}
          >
            <Sun size={24} />
            <strong>Light</strong>
            <span>Bright and clean</span>

            {theme === "light" && <CheckCircle2 size={17} />}
          </button>

          <button
            type="button"
            className={`settings-theme-option ${
              theme === "dark" ? "selected" : ""
            }`}
            onClick={() => setTheme("dark")}
          >
            <Moon size={24} />
            <strong>Dark</strong>
            <span>Easy on the eyes</span>

            {theme === "dark" && <CheckCircle2 size={17} />}
          </button>

          <button
            type="button"
            className={`settings-theme-option ${
              theme === "system" ? "selected" : ""
            }`}
            onClick={() => setTheme("system")}
          >
            <Monitor size={24} />
            <strong>System</strong>
            <span>Follow device settings</span>

            {theme === "system" && <CheckCircle2 size={17} />}
          </button>

        </div>

        <p className="settings-note">
          Your theme is applied immediately throughout the application.
        </p>

      </section>

      {/* NOTIFICATIONS */}
      <section className="settings-card">

        <div className="settings-card-heading">
          <div className="settings-icon orange">
            <Bell size={21} />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>Control your notification preferences</p>
          </div>
        </div>

        <div className="settings-toggle-row">

          <div>
            <strong>Enable Notifications</strong>

            <span>
              Manage whether LifeOS notifications are enabled.
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            aria-label="Enable notifications"
            className={`settings-switch ${
              notifications ? "active" : ""
            }`}
            onClick={() =>
              setNotifications((current) => !current)
            }
          >
            <span />
          </button>

        </div>

      </section>

      {/* ACCOUNT SECURITY */}
      <section className="settings-card">

        <div className="settings-card-heading">
          <div className="settings-icon green">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h2>Account Security</h2>
            <p>Keep your account protected</p>
          </div>
        </div>

        <div className="settings-security-row">

          <div className="settings-security-info">

            <div className="settings-security-icon">
              <Lock size={19} />
            </div>

            <div>
              <strong>Password Protection</strong>

              <span>
                Update your password to keep your account secure.
              </span>
            </div>

          </div>

          <span className="settings-security-badge">
            Protected
          </span>

        </div>

        {/* CHANGE PASSWORD FORM */}
        <form
          onSubmit={handleChangePassword}
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >

          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <KeyRound size={19} />
            <strong>Change Password</strong>
          </div>

          {/* CURRENT PASSWORD */}
          <div className="settings-field">
            <label htmlFor="current-password">
              Current Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
                maxLength={128}
                style={passwordInputStyle}
              />

              <button
                type="button"
                style={eyeButtonStyle}
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
                onClick={() =>
                  setShowCurrentPassword((current) => !current)
                }
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="settings-field">
            <label htmlFor="new-password">
              New Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Create a new password"
                autoComplete="new-password"
                maxLength={128}
                style={passwordInputStyle}
              />

              <button
                type="button"
                style={eyeButtonStyle}
                aria-label={
                  showNewPassword ? "Hide password" : "Show password"
                }
                onClick={() =>
                  setShowNewPassword((current) => !current)
                }
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* PASSWORD STRENGTH */}
            {newPassword && (
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "7px",
                    fontSize: "12px",
                  }}
                >
                  <span>Password strength</span>
                  <strong>{passwordStrengthLabel}</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: "5px",
                        flex: 1,
                        borderRadius: "10px",
                        background:
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "#ef4444"
                              : passwordStrength <= 3
                                ? "#f59e0b"
                                : "#22c55e"
                            : "var(--border-color, #e5e7eb)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <small>
              Use at least 8 characters. A mix of uppercase, lowercase,
              numbers and symbols is recommended.
            </small>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="settings-field">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your new password again"
                autoComplete="new-password"
                maxLength={128}
                style={passwordInputStyle}
              />

              <button
                type="button"
                style={eyeButtonStyle}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {confirmPassword && (
              <small
                style={{
                  color:
                    confirmPassword === newPassword
                      ? "#16a34a"
                      : "#ef4444",
                }}
              >
                {confirmPassword === newPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </small>
            )}
          </div>

          {/* PASSWORD FEEDBACK */}
          {passwordError && (
            <div
              role="alert"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.09)",
                color: "#dc2626",
                fontSize: "13px",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div
              role="status"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.09)",
                color: "#16a34a",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={17} />
              {passwordMessage}
            </div>
          )}

          <button
            type="submit"
            className="settings-save-button"
            disabled={isChangingPassword}
            style={{
              alignSelf: "flex-start",
              opacity: isChangingPassword ? 0.7 : 1,
            }}
          >
            <Lock size={17} />
            {isChangingPassword ? "Updating Password..." : "Change Password"}
          </button>

        </form>

        <p className="settings-note">
          Your new password is securely hashed before it is stored.
        </p>

      </section>

      {/* LIFEOS EXPERIENCE */}
      <section className="settings-card settings-experience-card">

        <div className="settings-experience-icon">
          <Sparkles size={23} />
        </div>

        <div>
          <h2>Your LifeOS Experience</h2>

          <p>
            Build better routines, achieve meaningful goals and
            make every day count.
          </p>
        </div>

      </section>

      {/* SAVE PREFERENCES */}
      <div className="settings-save-area">

        <button
          type="button"
          className="settings-save-button"
          onClick={savePreferences}
          disabled={isSavingPreferences || isLoadingPreferences}
        >
          <Save size={17} />
          {isLoadingPreferences
            ? "Loading Preferences..."
            : isSavingPreferences
              ? "Saving..."
              : "Save Preferences"}
        </button>

      </div>

      {/* LOGOUT */}
      <section className="settings-card settings-logout-card">

        <div className="settings-card-heading">
          <div className="settings-icon red">
            <LogOut size={21} />
          </div>

          <div>
            <h2>Sign Out</h2>
            <p>Sign out of your LifeOS account on this device</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Log Out
        </button>

      </section>

      {/* FOOTER */}
      <footer className="settings-footer">
        LifeOS · Your life, organized intelligently.
      </footer>

    </div>
  );
};

export default Settings;
