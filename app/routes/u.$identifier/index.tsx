import { Link, useMatches } from "@remix-run/react";
import clsx from "clsx";
import * as React from "react";
import invariant from "tiny-invariant";
import { Avatar } from "~/components/Avatar";
import { Badge } from "~/components/Badge";
import { Flag } from "~/components/Flag";
import { TwitchIcon } from "~/components/icons/Twitch";
import { TwitterIcon } from "~/components/icons/Twitter";
import { YouTubeIcon } from "~/components/icons/YouTube";
import { WeaponImage } from "~/components/Image";
import { useTranslation } from "~/hooks/useTranslation";
import { type SendouRouteHandle } from "~/utils/remix";
import { rawSensToString } from "~/utils/strings";
import type { Unpacked } from "~/utils/types";
import { assertUnreachable } from "~/utils/types";
import { teamPage, userSubmittedImage } from "~/utils/urls";
import { badgeExplanationText } from "../badges/$id";
import type { UserPageLoaderData } from "../u.$identifier";

export const handle: SendouRouteHandle = {
  i18n: "badges",
};

export default function UserInfoPage() {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  return (
    <div className="u__container">
      <div className="u__avatar-container">
        <Avatar user={data} size="lg" className="u__avatar" />
        <div>
          <h2 className="u__name">
            <div>{data.discordName}</div>
            <div>
              <span className="u__discriminator">
                <wbr />#{data.discordDiscriminator}
              </span>
              {data.country ? <Flag countryCode={data.country} tiny /> : null}
            </div>
          </h2>
          <TeamInfo />
        </div>
        <div className="u__socials">
          {data.twitch ? (
            <SocialLink type="twitch" identifier={data.twitch} />
          ) : null}
          {data.twitter ? (
            <SocialLink type="twitter" identifier={data.twitter} />
          ) : null}
          {data.youtubeId ? (
            <SocialLink type="youtube" identifier={data.youtubeId} />
          ) : null}
        </div>
      </div>
      <ExtraInfos />
      <WeaponPool />
      <BadgeContainer badges={data.badges} />
      {data.bio && <article>{data.bio}</article>}
    </div>
  );
}

function TeamInfo() {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const { team } = parentRoute.data as UserPageLoaderData;

  if (!team) return null;

  return (
    <Link to={teamPage(team.customUrl)} className="u__team">
      {team.avatarUrl ? (
        <img
          alt=""
          src={userSubmittedImage(team.avatarUrl)}
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : null}
      {team.name}
    </Link>
  );
}

interface SocialLinkProps {
  type: "youtube" | "twitter" | "twitch";
  identifier: string;
}

export function SocialLink({
  type,
  identifier,
}: {
  type: "youtube" | "twitter" | "twitch";
  identifier: string;
}) {
  const href = () => {
    switch (type) {
      case "twitch":
        return `https://www.twitch.tv/${identifier}`;
      case "twitter":
        return `https://www.twitter.com/${identifier}`;
      case "youtube":
        return `https://www.youtube.com/channel/${identifier}`;
      default:
        assertUnreachable(type);
    }
  };

  return (
    <a
      className={clsx("u__social-link", {
        youtube: type === "youtube",
        twitter: type === "twitter",
        twitch: type === "twitch",
      })}
      href={href()}
    >
      <SocialLinkIcon type={type} />
    </a>
  );
}

function SocialLinkIcon({ type }: Pick<SocialLinkProps, "type">) {
  switch (type) {
    case "twitch":
      return <TwitchIcon />;
    case "twitter":
      return <TwitterIcon />;
    case "youtube":
      return <YouTubeIcon />;
    default:
      assertUnreachable(type);
  }
}

function ExtraInfos() {
  const { t } = useTranslation(["user"]);
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  const motionSensText =
    typeof data.motionSens === "number"
      ? ` / ${t("user:motion")} ${rawSensToString(data.motionSens)}`
      : "";

  if (!data.inGameName && typeof data.stickSens !== "number") {
    return null;
  }

  return (
    <div className="u__extra-infos">
      {data.inGameName && (
        <div className="u__extra-info">
          <span className="u__extra-info__heading">{t("user:ign.short")}</span>{" "}
          {data.inGameName}
        </div>
      )}
      {typeof data.stickSens === "number" && (
        <div className="u__extra-info">
          <span className="u__extra-info__heading">{t("user:sens")}</span>{" "}
          {t("user:stick")} {rawSensToString(data.stickSens)}
          {motionSensText}
        </div>
      )}
    </div>
  );
}

function WeaponPool() {
  const [, parentRoute] = useMatches();
  invariant(parentRoute);
  const data = parentRoute.data as UserPageLoaderData;

  return (
    <div className="stack horizontal sm justify-center">
      {data.weapons.map((weapon, i) => {
        return (
          <div key={weapon} className="u__weapon">
            <WeaponImage
              testId={`${weapon}-${i + 1}`}
              weaponSplId={weapon}
              variant="badge"
              width={38}
              height={38}
            />
          </div>
        );
      })}
    </div>
  );
}

function BadgeContainer(props: { badges: UserPageLoaderData["badges"] }) {
  const { t } = useTranslation("badges");
  const [badges, setBadges] = React.useState(props.badges);

  // keep badges in sync when route changes from one user profile to another
  React.useEffect(() => {
    setBadges(props.badges);
  }, [props.badges]);

  const [bigBadge, ...smallBadges] = badges;
  if (!bigBadge) return null;

  const setBadgeFirst = (badge: Unpacked<UserPageLoaderData["badges"]>) => {
    setBadges(
      badges.map((b, i) => {
        if (i === 0) return badge;
        if (b.code === badge.code) return badges[0]!;

        return b;
      })
    );
  };

  return (
    <div>
      <div
        className={clsx("u__badges", {
          "justify-center": smallBadges.length === 0,
        })}
      >
        <Badge badge={bigBadge} size={125} isAnimated />
        {smallBadges.length > 0 ? (
          <div className="u__small-badges">
            {smallBadges.map((badge) => (
              <div key={badge.id} className="u__small-badge-container">
                <Badge
                  badge={badge}
                  onClick={() => setBadgeFirst(badge)}
                  size={48}
                  isAnimated
                />
                {badge.count > 1 ? (
                  <div className="u__small-badge-count">×{badge.count}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="u__badge-explanation">
        {badgeExplanationText(t, bigBadge)}
      </div>
    </div>
  );
}
