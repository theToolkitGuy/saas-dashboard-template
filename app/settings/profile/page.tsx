"use client";

import { useEffect, useState } from "react";
import { UserIcon, Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAppState } from "@/lib/state/provider";
import { deleteAccount, updateProfile } from "@/lib/backend";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { Button } from "@/components/atom/Button";
import { HoldButton } from "@/components/molecule/HoldButton";
import { SettingsPage, SettingsSection } from "@/components/molecule/SettingsSection";

// Profile: name, email and account deletion. Saves go through
// lib/backend.ts (updateProfile / deleteAccount) and into the local state.

const INPUT =
  "w-full px-3 py-1.5 text-sm rounded-md border border-base-300 bg-base-300/40 dark:bg-black text-base-content placeholder:text-neutral focus:outline-hidden focus:ring-1 focus:ring-silver";

export default function ProfilePage() {
  const { state, update } = useAppState();
  const [name, setName] = useState(state.user.name);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState(state.user.email);
  const [deleted, setDeleted] = useState(false);

  // Follow the state when it changes from outside (switcher, host page).
  useEffect(() => setName(state.user.name), [state.user.name]);
  useEffect(() => setEmail(state.user.email), [state.user.email]);

  const saveName = async () => {
    const next = name.trim();
    if (!next || next === state.user.name) return;
    await updateProfile({ name: next });
    update((s) => ({ ...s, user: { ...s.user, name: next } }));
  };
  const saveEmail = async () => {
    await updateProfile({ email });
    update((s) => ({ ...s, user: { ...s.user, email } }));
    setEmailOpen(false);
  };

  return (
    <Layout title="Profile" titleIcon={UserIcon} titleIconClass="text-neutral" titleHref="/settings/profile" activeItem="Profile">
      <PageContent>
        <SettingsPage>
          <SettingsSection title="Your name" description="Used across the entire application" gap="gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="Full name"
              autoComplete="name"
              className={INPUT}
            />
          </SettingsSection>

          <SettingsSection title="Your email" description="The email associated with your account" gap="gap-3">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex flex-row items-center gap-4 w-full">
                <input
                  type="email"
                  value={email}
                  readOnly={!emailOpen}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  className={(emailOpen ? "" : "text-neutral! ") + INPUT}
                />
                {!emailOpen && (
                  <button type="button" aria-label="Edit email" onClick={() => setEmailOpen(true)} className="group self-stretch w-9 flex items-center justify-center rounded-md border border-base-300 bg-base-300/40 cursor-pointer">
                    <HugeiconsIcon icon={Edit03Icon} strokeWidth={2} size={16} className="text-ash group-hover:text-stone" />
                  </button>
                )}
              </div>
              {emailOpen && (
                <div className="flex flex-row gap-2">
                  <Button label="Save email" onClick={saveEmail} />
                  <Button
                    label="Cancel"
                    onClick={() => {
                      setEmail(state.user.email);
                      setEmailOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </SettingsSection>

          <SettingsSection title="Delete account" description="Permanently delete your account and all its data. This cannot be undone." gap="gap-4">
            {deleted ? (
              <p className="text-sm text-neutral">Deleted (demo). Wire deleteAccount() in lib/backend.ts to make it real.</p>
            ) : (
              <HoldButton
                label="Hold to delete account"
                holdingLabel="Keep holding…"
                completeLabel="Deleted"
                bgClass="bg-error text-error-content"
                fillClass="text-teracotta"
                className="self-start"
                onHoldComplete={async () => {
                  await deleteAccount();
                  setDeleted(true);
                }}
              />
            )}
          </SettingsSection>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}
