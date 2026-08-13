import type { ComponentSpec } from "@toptop/design-system-contract";

export function ComponentIllustration({
  component,
}: {
  component: ComponentSpec;
}) {
  const button = component.previewKey === "button";
  const bottom = component.previewKey === "bottom-navigation";
  const regular = component.previewKey === "regular-navigation";
  const primary = component.previewKey === "primary-navigation";
  const underline = component.previewKey === "secondary-tab-underline";

  return (
    <figure className="componentIllustration">
      <div
        className="appleIllustration"
        role="img"
        aria-label={`${component.title} 的结构与交互示意`}
      >
        <div className="appleIllustrationToolbar">
          <span className="windowDots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>TopTop UI · Preview</span>
        </div>
        <div className="appleIllustrationCanvas">
          <p className="illustrationEyebrow">Interactive component</p>
          <div className="appleIllustrationDevice">
            {button ? (
              <ButtonDiagram />
            ) : bottom ? (
              <BottomNavigationDiagram />
            ) : regular ? (
              <RegularNavigationDiagram />
            ) : primary ? (
              <PrimaryNavigationDiagram />
            ) : underline ? (
              <UnderlineTabDiagram />
            ) : (
              <PillTabDiagram />
            )}
          </div>
          <div className="illustrationGestureHint">
            <span className="gestureIcon" aria-hidden="true">↔</span>
            <span>
              {button
                ? "默认、禁用与按下状态"
                : bottom
                ? "切换 App 一级目的地"
                : regular
                ? "返回、关闭与页面操作"
                : primary
                ? "横向浏览并选择"
                : underline
                  ? "左右滑动切换内容"
                  : "点击切换选中状态"}
            </span>
          </div>
        </div>
      </div>
      <figcaption>
        <span>结构 · 状态 · 交互</span>
        <span>{component.category ?? "Component"}</span>
      </figcaption>
    </figure>
  );
}

function ButtonDiagram() {
  return (
    <>
      <DiagramContent title="Action area">
        <span />
        <span />
        <span />
      </DiagramContent>
      <div className="diagramButtonGroup">
        <span>Cancel</span>
        <strong>Confirm</strong>
      </div>
    </>
  );
}

function BottomNavigationDiagram() {
  return (
    <>
      <DiagramContent title="App destinations">
        <span />
        <span />
        <span />
      </DiagramContent>
      <div className="diagramBottomNavigation">
        {[
          ["toptop", "TopTop"],
          ["room", "Room"],
          ["feed", "Feed"],
          ["message", "Message"],
          ["me", "Me"],
        ].map(([key, label], index) => (
          <span className={index === 0 ? "selected" : ""} key={key}>
            <i
              className={`bottomNavigationGlyph bottomNavigationGlyph-${key}`}
            />
            <small>{label}</small>
          </span>
        ))}
      </div>
    </>
  );
}

function RegularNavigationDiagram() {
  return (
    <>
      <div className="diagramRegularNavigation">
        <span aria-hidden="true">‹</span>
        <strong>主标题</strong>
        <i>Post</i>
      </div>
      <DiagramContent title="Secondary page">
        <span />
        <span />
        <span />
      </DiagramContent>
    </>
  );
}

function PrimaryNavigationDiagram() {
  return (
    <>
      <div className="diagramPrimaryNavigation">
        <strong>Mine</strong>
        <span>Popular</span>
        <span>Country</span>
        <i />
        <SearchGlyph />
      </div>
      <DiagramContent title="Your space">
        <span />
        <span />
        <span />
      </DiagramContent>
    </>
  );
}

function UnderlineTabDiagram() {
  return (
    <>
      <div className="diagramUnderlineTab">
        <strong>About me</strong>
        <span>Movement (6)</span>
      </div>
      <DiagramContent title="TopTop Player">
        <span />
        <span />
        <span />
      </DiagramContent>
    </>
  );
}

function PillTabDiagram() {
  return (
    <>
      <div className="diagramPillTab">
        <strong>Vehicles</strong>
        <span>Gifts</span>
        <span>Set</span>
      </div>
      <DiagramContent title="Collection">
        <span />
        <span />
        <span />
      </DiagramContent>
    </>
  );
}

function DiagramContent({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="diagramContent">
      <div className="diagramAvatar" />
      <div>
        <strong>{title}</strong>
        <div className="diagramLines">{children}</div>
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22">
      <circle cx="9.5" cy="9.5" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m13.8 13.8 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
