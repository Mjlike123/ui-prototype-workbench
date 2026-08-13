export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type UiNode = {
  id: string;
  lookinOid?: string;
  name?: string;
  type: string;
  classChain?: string[];
  frame: Rect;
  localFrame?: Rect;
  frameToRoot?: Rect;
  text?: string;
  color?: RGBA;
  backgroundColor?: RGBA;
  fontSize?: number;
  fontName?: string;
  fontWeight?: number | string;
  lineHeight?: number;
  cornerRadius?: number;
  accessibilityIdentifier?: string;
  selected?: boolean;
  alpha?: number;
  safeArea?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  imageName?: string;
  screenshotData?: string;
  screenshotMimeType?: "image/png";
  visible?: boolean;
  children?: UiNode[];
};

export type UiSnapshot = {
  pageName: string;
  device: {
    name?: string;
    width: number;
    height: number;
    scale?: number;
    safeAreaTop?: number;
    safeAreaBottom?: number;
  };
  screenshotPath?: string;
  screenshotData?: string;
  screenshotMimeType?: "image/png";
  capturedAt?: string;
  root: UiNode;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  frame: Rect;
  text?: string;
  color?: RGBA;
  backgroundColor?: RGBA;
  strokeColor?: RGBA;
  strokeWeight?: number;
  opacity?: number;
  fontSize?: number;
  fontName?: string;
  fontWeight?: number | string;
  lineHeight?: number;
  textAlignHorizontal?: string;
  cornerRadius?: number;
  componentId?: string;
  componentName?: string;
  componentKey?: string;
  componentProperties?: Record<string, string>;
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  constraints?: {
    horizontal?: string;
    vertical?: string;
  };
  variableRefs?: Record<string, string>;
  children?: FigmaNode[];
};

export type FigmaDesign = {
  fileKey?: string;
  nodeId?: string;
  frameName: string;
  frame: Rect;
  designVersion?: string;
  lastModified?: string;
  screenshotPath?: string;
  screenshotData?: string;
  screenshotMimeType?: "image/png";
  root: FigmaNode;
};

export type MatchPair = {
  design: FigmaNode;
  actual: UiNode;
  score: number;
  confidence: "low" | "medium" | "high";
  reasons: string[];
};

export type AuditSeverity = "low" | "medium" | "high";
export type AuditIssueStatus =
  | "open"
  | "confirmed"
  | "ignored"
  | "needs_confirmation";

export type AuditIssue = {
  id: string;
  pageName: string;
  type:
    | "size"
    | "spacing"
    | "alignment"
    | "missing"
    | "extra"
    | "text"
    | "color"
    | "font"
    | "cornerRadius"
    | "image"
    | "structure";
  severity: AuditSeverity;
  status: AuditIssueStatus;
  ruleId?: string;
  group?: ComponentRuleCategory;
  profileId?: string;
  affectedItems?: string[];
  details?: string[];
  description: string;
  suggestion: string;
  designValue: string;
  actualValue: string;
  delta: string;
  confidence: number;
  designNodeId?: string;
  actualNodeId?: string;
  designNode?: FigmaNode;
  actualNode?: UiNode;
  cropHint?: Rect;
};

export type AuditThresholds = {
  sizePt: number;
  sizePercent: number;
  spacingPt: number;
  alignmentPt: number;
  colorChannel: number;
  fontSizePt: number;
  lineHeightPt: number;
  cornerRadiusPt: number;
  lowConfidence: number;
};

export type AuditConfig = {
  thresholds: AuditThresholds;
};

export type ComponentRuleCategory =
  | "structure"
  | "spacing"
  | "selected"
  | "unselected";

export type ComponentRuleMetric =
  | "height"
  | "width"
  | "horizontalPadding"
  | "gap"
  | "textColor"
  | "backgroundColor";

export type ComponentAuditRule = {
  id: string;
  title: string;
  category: ComponentRuleCategory;
  metric: ComponentRuleMetric;
  state?: "selected" | "unselected";
  tolerance: number;
  aggregate: "rule";
};

export type ComponentAuditProfile = {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  owner?: string;
  category?: string;
  status?: "draft" | "review" | "stable" | "deprecated";
  since?: string;
  tags?: string[];
  platforms: Array<"ios" | "android" | "h5">;
  description?: string;
  previewKey?: string;
  reference?: {
    figmaUrl: string;
    nodeId: string;
    observations?: string[];
  };
  anatomy?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  variants?: Array<{
    name: string;
    values: string[];
    defaultValue?: string;
  }>;
  props?: Array<{
    name: string;
    type: string;
    required?: boolean;
    defaultValue?: string | number | boolean;
    description: string;
  }>;
  tokenRefs?: string[];
  interactionIds?: string[];
  platformMappingIds?: string[];
  accessibility?: string[];
  detection: {
    figmaFileKeys?: string[];
    figmaComponentIds: string[];
    nameAliases: string[];
    selectedStateAliases?: string[];
    unselectedStateAliases?: string[];
  };
  roles: Array<
    | "container"
    | "tabItem"
    | "label"
    | "selectedItem"
    | "unselectedItem"
    | "field"
    | "searchIcon"
    | "input"
    | "clearButton"
    | "cancelAction"
    | "listItem"
    | "leading"
    | "content"
    | "title"
    | "subtitle"
    | "tagList"
    | "trailing"
    | "avatarImage"
    | "decorationFrame"
    | "statusBadge"
    | "icon"
    | "value"
    | "membershipAsset"
    | "modeAction"
    | "photoAction"
    | "emojiAction"
    | "voiceHold"
    | "gameAction"
    | "trailingAction"
    | "replyPreview"
    | "readStatusUpsell"
  >;
  rules: ComponentAuditRule[];
};

export type SemanticTabItem = {
  key: string;
  label: string;
  state: "selected" | "unselected";
  itemNodeId: string;
  labelNodeId: string;
  frame: Rect;
  labelFrame: Rect;
  leftPadding: number;
  rightPadding: number;
  textColor?: RGBA;
  backgroundColor?: RGBA;
  confidence: number;
};

export type ComponentSemanticModel = {
  profileId: string;
  side: "design" | "actual";
  containerNodeId: string;
  containerFrame: Rect;
  items: SemanticTabItem[];
  confidence: number;
  warnings: string[];
};

export type ComponentSemanticMapping = {
  label: string;
  state: "selected" | "unselected";
  designItemNodeId: string;
  designLabelNodeId: string;
  actualItemNodeId?: string;
  actualLabelNodeId?: string;
  confidence: number;
};
