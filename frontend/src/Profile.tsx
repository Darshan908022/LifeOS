
import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";

import {
  User,
  Mail,
  Trash2,
  Save,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  AtSign,
  CheckCircle2,
  Camera,
  ImagePlus,
} from "lucide-react";

import api from "./services/api";
import "./Profile.css";

interface UserProfile {
  id?: number | string;
  name?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
  avatar_url?: string;
}

interface ProfileProps {
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
}

const Profile = ({ profile, setProfile }: ProfileProps) => {
  const [displayName, setDisplayName] = useState(
    profile.full_name || profile.name || ""
  );

  const [email, setEmail] = useState(profile.email || "");

  const [profileImage, setProfileImage] = useState(
    profile.profile_image || profile.avatar_url || ""
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // SYNC PROFILE WITH APP STATE
  useEffect(() => {
    setDisplayName(
      profile.full_name || profile.name || ""
    );

    setEmail(profile.email || "");

    setProfileImage(
      profile.profile_image || profile.avatar_url || ""
    );
  }, [
    profile.id,
    profile.full_name,
    profile.name,
    profile.email,
    profile.profile_image,
    profile.avatar_url,
  ]);

  // PROFILE PHOTO UPLOAD
  const handlePhotoUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setMessage("Photo preview updated. Save your profile.");
      }
    };

    reader.onerror = () => {
      setError("Unable to read this image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // SAVE PROFILE TO BACKEND
  const handleSave = async () => {
    const trimmedName = displayName.trim();

    if (trimmedName.length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Your name cannot exceed 100 characters.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setMessage("");

      const response = await api.put("/auth/me", {
        full_name: trimmedName,
        profile_image: profileImage || null,
      });

      const updatedProfile = response.data;

      setProfile({
        ...profile,
        ...updatedProfile,
        name: updatedProfile.full_name,
        avatar_url: updatedProfile.profile_image || undefined,
      });

      setDisplayName(updatedProfile.full_name);
      setProfileImage(updatedProfile.profile_image || "");

      setMessage("Your profile has been saved successfully!");
    } catch (err) {
      console.error("Unable to save profile:", err);

      const apiError = err as {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.detail ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // REMOVE PHOTO
  const handleRemovePhoto = () => {
    setProfileImage("");
    setMessage("Photo removed. Save your changes to apply.");
    setError("");
  };

  const userName =
    displayName ||
    profile.full_name ||
    profile.name ||
    "LifeOS User";

  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}
      <section className="profile-page-header">
        <div className="profile-header-content">
          <div className="profile-eyebrow">
            <Sparkles size={14} />
            YOUR PERSONAL SPACE
          </div>

          <h1>My Profile</h1>

          <p>
            Manage your identity and personalize your LifeOS
            experience.
          </p>
        </div>

        <div className="profile-header-decoration">
          <div className="profile-header-decoration-inner">
            <User size={30} />
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      {message && (
        <div className="profile-message">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="profile-error">
          <span>{error}</span>
        </div>
      )}

      {/* PROFILE HERO */}
      <section className="profile-hero-card">

        <div className="profile-hero-glow" />

        <div className="profile-hero-main">

          <div className="profile-large-avatar">
            {profileImage ? (
              <img src={profileImage} alt="Profile" />
            ) : (
              <span>{initial}</span>
            )}

            <div className="profile-avatar-status">
              <CheckCircle2 size={15} />
            </div>
          </div>

          <div className="profile-hero-info">
            <div className="profile-member-label">
              <ShieldCheck size={15} />
              LIFEOS MEMBER
            </div>

            <h2>{userName}</h2>

            <p className="profile-hero-email">
              <Mail size={15} />
              {email || "Email not available"}
            </p>

            <div className="profile-hero-tags">
              <span>
                <User size={13} />
                Personal Account
              </span>

              <span>
                <Sparkles size={13} />
                LifeOS Workspace
              </span>
            </div>
          </div>
        </div>

        <div className="profile-hero-side">
          <div className="profile-hero-side-icon">
            <Sparkles size={21} />
          </div>

          <strong>Your space. Your journey.</strong>
          <span>Make LifeOS your own.</span>
        </div>

      </section>

      {/* PERSONAL INFORMATION */}
      <section className="profile-content-card">

        <div className="profile-section-heading">
          <div className="profile-section-icon">
            <User size={20} />
          </div>

          <div>
            <h2>Personal Information</h2>
            <p>Update and manage your personal details.</p>
          </div>
        </div>

        {/* PROFILE PHOTO */}
        <div className="profile-photo-section">

          <div className="profile-photo-preview">
            {profileImage ? (
              <img src={profileImage} alt="Your profile" />
            ) : (
              <span>{initial}</span>
            )}

            <div className="profile-photo-camera">
              <Camera size={15} />
            </div>
          </div>

          <div className="profile-photo-info">
            <strong>Profile Photo</strong>

            <p>
              Choose a photo that represents you.
              JPG, PNG or WEBP. Maximum size 2 MB.
            </p>

            <div className="profile-photo-buttons">

              <label
                htmlFor="profile-photo-input"
                className="profile-upload-button"
              >
                <ImagePlus size={16} />
                Upload Photo
              </label>

              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                hidden
                onChange={handlePhotoUpload}
              />

              {profileImage && (
                <button
                  type="button"
                  className="profile-remove-button"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              )}

            </div>
          </div>
        </div>

        <div className="profile-form-divider" />

        {/* FORM FIELDS */}
        <div className="profile-form-grid">

          <div className="profile-field">
            <label htmlFor="profile-name">
              Full Name
            </label>

            <div className="profile-input-wrapper">
              <User size={17} />

              <input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                placeholder="Enter your full name"
                maxLength={100}
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">
              Email Address
            </label>

            <div className="profile-input-wrapper profile-input-readonly">
              <Mail size={17} />

              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
              />

              <ShieldCheck
                size={15}
                className="profile-verified-icon"
              />
            </div>

            <small>Your registered account email.</small>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-account-id">
              Account ID
            </label>

            <div className="profile-input-wrapper profile-input-readonly">
              <AtSign size={17} />

              <input
                id="profile-account-id"
                type="text"
                value={
                  profile.id ? String(profile.id) : "Unavailable"
                }
                readOnly
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="profile-account-type">
              Account Type
            </label>

            <div className="profile-input-wrapper profile-input-readonly">
              <ShieldCheck size={17} />

              <input
                id="profile-account-type"
                type="text"
                value="Personal Account"
                readOnly
              />
            </div>
          </div>

        </div>

        <div className="profile-save-area">
          <span className="profile-save-note">
            <ShieldCheck size={14} />
            Your profile is securely saved to your LifeOS account.
          </span>

          <button
            type="button"
            className="profile-save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={17} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </section>

      {/* ACCOUNT OVERVIEW */}
      <section className="profile-content-card">

        <div className="profile-section-heading">
          <div className="profile-section-icon profile-section-icon-blue">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2>Account Overview</h2>
            <p>Your account information at a glance.</p>
          </div>
        </div>

        <div className="profile-overview-grid">

          <div className="profile-overview-item">
            <div className="profile-overview-icon purple">
              <User size={19} />
            </div>

            <div>
              <span>Account</span>
              <strong>Personal</strong>
            </div>
          </div>

          <div className="profile-overview-item">
            <div className="profile-overview-icon blue">
              <Mail size={19} />
            </div>

            <div>
              <span>Email Address</span>
              <strong>{email || "Not available"}</strong>
            </div>
          </div>

          <div className="profile-overview-item">
            <div className="profile-overview-icon green">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Workspace</span>
              <strong>LifeOS</strong>
            </div>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="profile-page-footer">
        <span>LifeOS © 2026</span>

        <span>
          Your identity. Your goals. Your growth.
          <Sparkles size={14} />
        </span>
      </footer>

    </div>
  );
};

export default Profile;
