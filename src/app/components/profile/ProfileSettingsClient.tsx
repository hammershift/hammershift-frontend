"use client";

import { useState, type FormEvent } from "react";
import SettingsSection from "./SettingsSection";

export interface EmailPrefs {
  weekly_digest: boolean;
  auction_reminders: boolean;
  result_notifications: boolean;
  marketing: boolean;
}

export interface SettingsUser {
  fullName: string;
  about: string;
  username: string;
  email: string;
  email_preferences: EmailPrefs;
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface SectionState {
  state: SaveState;
  error: string | null;
}

const IDLE: SectionState = { state: "idle", error: null };

interface SaveFlagProps {
  status: SectionState;
}

function SaveFlag({ status }: SaveFlagProps) {
  if (status.state === "saved") {
    return (
      <span className="text-sm font-medium text-[#00D4AA]">Saved</span>
    );
  }
  if (status.state === "error") {
    return (
      <span className="text-sm font-medium text-[#E94560]">
        {status.error ?? "Save failed"}
      </span>
    );
  }
  return null;
}

interface Props {
  user: SettingsUser;
}

export default function ProfileSettingsClient({ user }: Props) {
  // Profile section
  const [fullName, setFullName] = useState(user.fullName);
  const [about, setAbout] = useState(user.about);
  const [profileStatus, setProfileStatus] = useState<SectionState>(IDLE);

  // Email preferences
  const [emailPrefs, setEmailPrefs] = useState<EmailPrefs>(
    user.email_preferences
  );
  const [emailStatus, setEmailStatus] = useState<SectionState>(IDLE);

  // Security section
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityStatus, setSecurityStatus] = useState<SectionState>(IDLE);

  function flashSaved(setter: (s: SectionState) => void): void {
    setter({ state: "saved", error: null });
    window.setTimeout(() => setter(IDLE), 2000);
  }

  async function readError(res: Response): Promise<string> {
    try {
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
      ) {
        return (data as { error: string }).error;
      }
    } catch {
      // ignore
    }
    return `Request failed (${res.status})`;
  }

  async function saveProfile(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setProfileStatus({ state: "saving", error: null });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, about }),
      });
      if (!res.ok) {
        setProfileStatus({ state: "error", error: await readError(res) });
        return;
      }
      flashSaved(setProfileStatus);
    } catch {
      setProfileStatus({ state: "error", error: "Network error" });
    }
  }

  async function saveEmailPrefs(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setEmailStatus({ state: "saving", error: null });
    try {
      const res = await fetch("/api/profile/email-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_preferences: emailPrefs }),
      });
      if (!res.ok) {
        setEmailStatus({ state: "error", error: await readError(res) });
        return;
      }
      flashSaved(setEmailStatus);
    } catch {
      setEmailStatus({ state: "error", error: "Network error" });
    }
  }

  async function saveSecurity(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (newPassword.length < 8) {
      setSecurityStatus({
        state: "error",
        error: "New password must be at least 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityStatus({
        state: "error",
        error: "New passwords do not match",
      });
      return;
    }
    setSecurityStatus({ state: "saving", error: null });
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        setSecurityStatus({ state: "error", error: await readError(res) });
        return;
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flashSaved(setSecurityStatus);
    } catch {
      setSecurityStatus({ state: "error", error: "Network error" });
    }
  }

  function toggleEmailPref(key: keyof EmailPrefs): void {
    setEmailPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mt-6 space-y-5">
      {/* 1. Profile */}
      <SettingsSection
        title="Profile"
        description="Your display name and bio."
      >
        <form className="space-y-4" onSubmit={saveProfile}>
          <div>
            <label
              htmlFor="settings-fullName"
              className="block text-sm font-medium text-gray-300"
            >
              Display name
            </label>
            <input
              id="settings-fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={80}
              className="mt-2 block w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#E94560]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-about"
              className="block text-sm font-medium text-gray-300"
            >
              Bio
            </label>
            <textarea
              id="settings-about"
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={500}
              placeholder="Tell the community about yourself"
              className="mt-2 block w-full resize-none rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#E94560]"
            />
            <p className="mt-1 text-xs text-gray-500">
              {about.length}/500
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <SaveFlag status={profileStatus} />
            <button
              type="submit"
              disabled={profileStatus.state === "saving"}
              className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d83a55] disabled:opacity-60"
            >
              {profileStatus.state === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </SettingsSection>

      {/* 2. Email preferences */}
      <SettingsSection
        title="Email preferences"
        description="What we send you."
      >
        <form className="space-y-3" onSubmit={saveEmailPrefs}>
          <EmailPrefRow
            id="pref-weekly_digest"
            label="Weekly digest"
            description="A weekly summary of your activity and top markets."
            checked={emailPrefs.weekly_digest}
            onChange={() => toggleEmailPref("weekly_digest")}
          />
          <EmailPrefRow
            id="pref-auction_reminders"
            label="Auction reminders"
            description="Reminders before auctions you've predicted close."
            checked={emailPrefs.auction_reminders}
            onChange={() => toggleEmailPref("auction_reminders")}
          />
          <EmailPrefRow
            id="pref-result_notifications"
            label="Result notifications"
            description="Email when your prediction is scored."
            checked={emailPrefs.result_notifications}
            onChange={() => toggleEmailPref("result_notifications")}
          />
          <EmailPrefRow
            id="pref-marketing"
            label="Marketing"
            description="Product news, launches, and promotions."
            checked={emailPrefs.marketing}
            onChange={() => toggleEmailPref("marketing")}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <SaveFlag status={emailStatus} />
            <button
              type="submit"
              disabled={emailStatus.state === "saving"}
              className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d83a55] disabled:opacity-60"
            >
              {emailStatus.state === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </SettingsSection>

      {/* 3. Notifications (placeholder — no backend yet) */}
      <SettingsSection
        title="Notifications"
        description="In-product alerts."
      >
        <p className="text-sm text-gray-400">
          Notification preferences coming soon.
        </p>
      </SettingsSection>

      {/* 4. Security */}
      <SettingsSection
        title="Security"
        description="Change your password."
      >
        <form className="space-y-4" onSubmit={saveSecurity}>
          <div>
            <label
              htmlFor="settings-oldPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Current password
            </label>
            <input
              id="settings-oldPassword"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="mt-2 block w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#E94560]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-newPassword"
              className="block text-sm font-medium text-gray-300"
            >
              New password
            </label>
            <input
              id="settings-newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="mt-2 block w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#E94560]"
            />
          </div>
          <div>
            <label
              htmlFor="settings-confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Confirm new password
            </label>
            <input
              id="settings-confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="mt-2 block w-full rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-3 py-2 text-sm text-white outline-none focus:border-[#E94560]"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <SaveFlag status={securityStatus} />
            <button
              type="submit"
              disabled={
                securityStatus.state === "saving" ||
                oldPassword.length === 0 ||
                newPassword.length === 0
              }
              className="rounded-lg bg-[#E94560] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d83a55] disabled:opacity-60"
            >
              {securityStatus.state === "saving" ? "Saving…" : "Update password"}
            </button>
          </div>
        </form>
      </SettingsSection>

      {/* 5. Data */}
      <SettingsSection
        title="Your data"
        description="Download a full export of your account data."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-400">
            JSON file with your profile, predictions, streaks, and badges.
          </p>
          <a
            href="/api/profile/export"
            download
            className="rounded-lg border border-white/[0.06] bg-[#0A0A1A] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
          >
            Export
          </a>
        </div>
      </SettingsSection>

      {/* 6. Danger zone — added in follow-up commit */}
    </div>
  );
}

interface EmailPrefRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function EmailPrefRow({
  id,
  label,
  description,
  checked,
  onChange,
}: EmailPrefRowProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.04] bg-[#0A0A1A] p-3 transition hover:border-white/10"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/20 bg-transparent accent-[#E94560]"
      />
      <span className="flex-1">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-xs text-gray-400">{description}</span>
      </span>
    </label>
  );
}
