export type LifecycleStatus = "draft" | "review" | "stable" | "deprecated";
export type Platform = "ios" | "android" | "h5";

export type ComponentRule = {
  id: string;
  title: string;
  category: "structure" | "spacing" | "selected" | "unselected";
  metric:
    | "height"
    | "width"
    | "horizontalPadding"
    | "gap"
    | "textColor"
    | "backgroundColor"
    | "iconSize"
    | "aspectRatio";
  state?: "selected" | "unselected";
  tolerance: number;
  aggregate: "rule";
};

export type ComponentSpec = {
  schemaVersion: 1;
  id: string;
  version: string;
  title: string;
  owner?: string;
  category?: string;
  status?: LifecycleStatus;
  since?: string;
  tags?: string[];
  platforms: Platform[];
  description?: string;
  previewKey?: string;
  reference?: {
    figmaUrl: string;
    nodeId: string;
    observations?: string[];
  };
  anatomy?: Array<{ id: string; label: string; description: string }>;
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
  roles: string[];
  rules: ComponentRule[];
};

export type FoundationToken = {
  id: string;
  name: string;
  value: string | number;
  modes?: {
    light: string | number;
    dark: string | number;
  };
  description: string;
  figmaVariableId?: string;
  platforms?: Partial<Record<Platform, string>>;
};

export type FoundationSpec = {
  schemaVersion: 1;
  id: string;
  title: string;
  category:
    | "color"
    | "typography"
    | "spacing"
    | "radius"
    | "shadow"
    | "grid"
    | "motion"
    | "icon";
  description?: string;
  tokens: FoundationToken[];
};

export type DesignPrinciple = {
  id: string;
  title: string;
  intent: string;
  commitments: string[];
  checks: string[];
  foundationRefs: string[];
  workflowRefs: string[];
};

export type DesignPrinciplesSpec = {
  schemaVersion: 1;
  id: string;
  title: string;
  status: LifecycleStatus;
  description: string;
  source: {
    title: string;
    url: string;
  };
  decisionOrder: string[];
  principles: DesignPrinciple[];
};

export type InteractionTransition = {
  from: string;
  to: string;
  trigger: string;
  feedback?: string;
  duration?: string;
  easing?: string;
};

export type InteractionSpec = {
  schemaVersion: 1;
  id: string;
  title: string;
  status: LifecycleStatus;
  description: string;
  componentIds?: string[];
  states: string[];
  transitions: InteractionTransition[];
  accessibility?: string[];
  edgeCases?: string[];
};

export type PlatformMappingSpec = {
  schemaVersion: 1;
  id: string;
  componentId: string;
  platforms: Partial<
    Record<
      Platform,
      {
        componentName: string;
        package?: string;
        codeExample: string;
        identifiers?: string[];
        status: "planned" | "partial" | "ready";
      }
    >
  >;
};

export type GenericAuditRule = {
  id: string;
  title: string;
  type: string;
  appliesTo: string;
  threshold: string;
  description: string;
};

export type AuditRuleRegistry = {
  schemaVersion: 1;
  id: string;
  rules: GenericAuditRule[];
};

export type FigmaSyncEntry = {
  componentId: string;
  fileKey?: string;
  nodeId?: string;
  frameName?: string;
  designVersion?: string;
  lastModified?: string;
  syncedAt: string;
  screenshotData?: string;
  screenshotMimeType?: "image/png";
};

export type PortalCatalog = {
  components: ComponentSpec[];
  foundations: FoundationSpec[];
  principles: DesignPrinciplesSpec[];
  interactions: InteractionSpec[];
  platformMappings: PlatformMappingSpec[];
  auditRegistries: AuditRuleRegistry[];
  figmaSync: Record<string, FigmaSyncEntry>;
};

export type ComponentCoverage = {
  documentation: boolean;
  reactPreview: boolean;
  iosAudit: boolean;
  platformCount: number;
};
