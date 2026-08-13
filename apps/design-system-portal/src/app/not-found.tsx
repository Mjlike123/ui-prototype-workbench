import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="panel emptyState">
      <div>
        <span className="emptyStateIcon">
          <Icon name="component" />
        </span>
        <h1>没有找到这项规范</h1>
        <p>组件可能已改名、废弃，或尚未进入 Design System Contract。</p>
        <div className="buttonRow" style={{ justifyContent: "center", marginTop: 16 }}>
          <Link className="button buttonPrimary" href="/components">
            返回组件列表
          </Link>
        </div>
      </div>
    </div>
  );
}
