"use client";

import { AvatarVisual } from "@/components/kit/avatar-visual";

export type PrototypeProfileStat = {
  key: string;
  label: string;
  value: string;
};

type PrototypeProfileIdentityProps = {
  displayName: string;
  userId: string;
  bio?: string;
  coverVisible?: boolean;
  stats: PrototypeProfileStat[];
  onStatPress: (key: string) => void;
  onAvatarPress?: () => void;
};

export function PrototypeProfileIdentity({
  displayName,
  userId,
  bio,
  coverVisible = true,
  stats,
  onStatPress,
  onAvatarPress,
}: PrototypeProfileIdentityProps) {
  return (
    <section className="profileHeader pageCanvasBlockFlush" aria-label="个人身份">
      {coverVisible ? (
        <div className="profileHeaderCover" aria-hidden="true" />
      ) : null}
      <div className="profileHeaderBody">
        <button
          type="button"
          className="profileHeaderAvatarButton"
          aria-label={`查看 ${displayName} 的头像`}
          onClick={onAvatarPress}
        >
          <AvatarVisual size={72} alt="" />
        </button>
        <div className="profileHeaderIdentity">
          <h2 className="profileHeaderName">{displayName}</h2>
          <p className="profileHeaderUserId">ID {userId}</p>
        </div>
      </div>
      <div className="profileHeaderStats" role="group" aria-label="社交数据">
        {stats.map((stat) => (
          <button
            key={stat.key}
            type="button"
            className="profileHeaderStat"
            onClick={() => onStatPress(stat.key)}
          >
            <span className="profileHeaderStatValue">{stat.value}</span>
            <span className="profileHeaderStatLabel">{stat.label}</span>
          </button>
        ))}
      </div>
      {bio ? <p className="profileHeaderBio">{bio}</p> : null}
    </section>
  );
}
