import { UserGroupIcon, DiscordIcon, NewsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import config from "@/saas.config";
import { Layout } from "@/components/organism/Layout";
import { PageContent } from "@/components/atom/PageContent";
import { SettingsPage, SettingsSection } from "@/components/molecule/SettingsSection";

// Community links. Set the URLs in saas.config.ts (community).

const LINK =
  "flex-1 w-full p-3 rounded-md border border-base-300 bg-base-300/40 hover:bg-base-300/60 flex flex-row items-center gap-2 transition-all duration-125 ease-in-out cursor-pointer";

export default function CommunityPage() {
  return (
    <Layout title="Community" titleIcon={UserGroupIcon} titleIconClass="text-neutral" titleHref="/community" activeItem="Community">
      <PageContent>
        <SettingsPage>
          <SettingsSection title="Join our community" description={`Talk with other ${config.app.name} users and the team`}>
            <a href={config.community.discordUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
              <HugeiconsIcon icon={DiscordIcon} size={16} strokeWidth={2} className="shrink-0 text-base-content" />
              <p className="text-sm !leading-[1] font-semibold text-base-content">Join our Discord</p>
            </a>
          </SettingsSection>
          <SettingsSection title="What's new" description={`Recent changes to ${config.app.name}`}>
            <a href={config.community.changelogUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
              <HugeiconsIcon icon={NewsIcon} size={16} strokeWidth={2} className="shrink-0 text-base-content" />
              <p className="text-sm !leading-[1] font-semibold text-base-content">Read the changelog</p>
            </a>
          </SettingsSection>
        </SettingsPage>
      </PageContent>
    </Layout>
  );
}
