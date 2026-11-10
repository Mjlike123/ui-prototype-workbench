"use client";

import { useState, type CSSProperties } from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SelectorButton } from "@/components/kit/selector-button";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";

type ReportScene = "general" | "profile" | "room";
type ReportRegion = "global" | "fr";
type SubmitState = "idle" | "submitting" | "success" | "error";

type StudioReportReasonPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
};

type ReportReason = {
  id: string;
  label: string;
  frOnly?: boolean;
};

const SCENES: readonly { id: ReportScene; label: string }[] = [
  { id: "general", label: "General" },
  { id: "profile", label: "Profile" },
  { id: "room", label: "Room" },
];

const REPORT_REASONS: readonly ReportReason[] = [
  { id: "insult", label: "Insult" },
  { id: "harassment", label: "Harassment" },
  { id: "pornography", label: "Pornography" },
  { id: "advertising-diversion", label: "Advertising / Diversion" },
  { id: "fraud", label: "Fraud" },
  { id: "hacker", label: "Hacker" },
  { id: "privacy-safety", label: "Privacy & Safety" },
  {
    id: "violence-gore-terrorism",
    label: "Violence / gore / terrorism",
  },
  {
    id: "political-religious",
    label: "Political / religious violations",
  },
  { id: "under-age", label: "Under age user", frOnly: true },
  { id: "impersonation", label: "Impersonation" },
  { id: "other", label: "Other" },
];

const PROFILE_TYPES = ["Avatar", "Nickname", "Signature", "Profile background"];
const ROOM_TYPES = ["Room cover", "Room name", "Room announcement"];

export function StudioReportReasonPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioReportReasonPageProps) {
  const [scene, setScene] = useState<ReportScene>("general");
  const [region, setRegion] = useState<ReportRegion>("global");
  const [simulateError, setSimulateError] = useState(false);

  return (
    <div
      className="studioReportShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
        } as CSSProperties
      }
    >
      <div
        className="studioReportControls"
        aria-label="Report prototype controls"
      >
        <div role="tablist" aria-label="Report page scenario">
          {SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={scene === item.id}
              className={
                scene === item.id
                  ? "studioReportControl studioReportControl--active"
                  : "studioReportControl"
              }
              onClick={() => setScene(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="studioReportControlToggle">
          <input
            type="checkbox"
            checked={region === "fr"}
            onChange={(event) =>
              setRegion(event.currentTarget.checked ? "fr" : "global")
            }
          />
          FR region
        </label>
        <label className="studioReportControlToggle">
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(event) => setSimulateError(event.currentTarget.checked)}
          />
          Simulate error
        </label>
      </div>

      <ReportReasonPrototype
        key={`${scene}-${region}`}
        width={width}
        height={height}
        theme={theme}
        scene={scene}
        region={region}
        simulateError={simulateError}
        onBack={onBack}
      />
    </div>
  );
}

function ReportReasonPrototype({
  width,
  height,
  theme,
  scene,
  region,
  simulateError,
  onBack,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  scene: ReportScene;
  region: ReportRegion;
  simulateError: boolean;
  onBack?: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [hasEvidence, setHasEvidence] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const requiresProfileType = scene !== "general";
  const otherComplete =
    selectedReason !== "other" || otherReason.trim().length > 0;
  const canSubmit =
    Boolean(selectedReason) &&
    otherComplete &&
    (!requiresProfileType || selectedTypes.length > 0) &&
    submitState !== "submitting";

  const typeOptions = scene === "profile" ? PROFILE_TYPES : ROOM_TYPES;
  const objectName = scene === "room" ? "ANDOR'S ROOM" : "Ninfa Lugo";

  const toggleType = (type: string, selected: boolean) => {
    setSelectedTypes((current) =>
      selected ? [...current, type] : current.filter((item) => item !== type),
    );
  };

  const submitReport = () => {
    if (!canSubmit) return;
    setSubmitState("submitting");
    window.setTimeout(() => {
      setSubmitState(simulateError ? "error" : "success");
    }, 720);
  };

  return (
    <div
      className={[
        "pageCanvasDevice",
        "studioReportDevice",
        theme === "dark" ? "studioReportDevice--dark" : "",
      ].join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Report reason optimization prototype · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <RegularNavigation title="Report" onBack={onBack} backLabel="Back" />

        <form
          className="studioReportForm"
          onSubmit={(event) => {
            event.preventDefault();
            submitReport();
          }}
        >
          <div className="studioReportScroll">
            {scene === "general" ? (
              <header className="studioReportIntro">
                <p>You are about to report</p>
                <strong>{objectName}</strong>
              </header>
            ) : null}

            {requiresProfileType ? (
              <ReportProfileTypeSection
                scene={scene}
                objectName={objectName}
                options={typeOptions}
                selectedTypes={selectedTypes}
                onToggle={toggleType}
              />
            ) : null}

            <fieldset className="studioReportSection studioReportReasonSection">
              <legend>
                <span aria-hidden="true">*</span> Please select a violation
              </legend>
              <div className="studioReportChoiceList">
                {REPORT_REASONS.filter(
                  (reason) => !reason.frOnly || region === "fr",
                ).map((reason) => {
                  const selected = selectedReason === reason.id;
                  return (
                    <div key={reason.id}>
                      <label
                        className={[
                          "studioReportChoiceRow",
                          selected ? "studioReportChoiceRow--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span>{reason.label}</span>
                        <SelectorButton
                          selected={selected}
                          selectionMode="single"
                          name="report-reason"
                          aria-label={reason.label}
                          onChange={() => {
                            setSelectedReason(reason.id);
                            if (reason.id !== "other") setOtherReason("");
                            setSubmitState("idle");
                          }}
                        />
                      </label>
                      {reason.id === "other" && selected ? (
                        <div className="studioReportOtherField">
                          <label htmlFor="studio-report-other">
                            Tell us what happened
                          </label>
                          <textarea
                            id="studio-report-other"
                            autoFocus
                            required
                            maxLength={100}
                            value={otherReason}
                            placeholder="Describe the violation"
                            aria-describedby="studio-report-other-hint studio-report-other-count"
                            onChange={(event) => {
                              setOtherReason(event.currentTarget.value);
                              setSubmitState("idle");
                            }}
                          />
                          <small>
                            <span id="studio-report-other-hint">
                              Required for Other
                            </span>
                            <span id="studio-report-other-count">
                              {otherReason.length}/100
                            </span>
                          </small>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div className="studioReportDescriptionField">
              <label htmlFor="studio-report-description">
                Violation description <em>Optional</em>
              </label>
              <textarea
                id="studio-report-description"
                maxLength={200}
                value={description}
                placeholder="Add details that may help us review your report"
                aria-describedby="studio-report-description-count"
                onChange={(event) => setDescription(event.currentTarget.value)}
              />
              <small id="studio-report-description-count">
                {description.length}/200
              </small>
            </div>

            <section
              className="studioReportEvidence"
              aria-labelledby="report-evidence-title"
            >
              <div>
                <h2 id="report-evidence-title">Photos or video</h2>
                <p>Optional · Up to 4 files</p>
              </div>
              {hasEvidence ? (
                <div className="studioReportEvidenceFile">
                  <SystemIcon name="photo" size={24} />
                  <span>
                    <strong>evidence.png</strong>
                    <small>1.8 MB</small>
                  </span>
                  <button
                    type="button"
                    aria-label="Remove evidence.png"
                    onClick={() => setHasEvidence(false)}
                  >
                    <SystemIcon name="close" size={20} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="kitButton kitButton--height40 kitButton--neutral-outline studioReportEvidenceAdd"
                  onClick={() => setHasEvidence(true)}
                >
                  <SystemIcon name="photo" size={24} />
                  Add evidence
                </button>
              )}
            </section>
          </div>

          <div className="studioReportActionDock">
            {submitState === "error" ? (
              <p className="studioReportSubmitError" role="alert">
                We couldn’t submit your report. Your details are saved—please
                try again.
              </p>
            ) : null}
            <div>
              <button
                type="button"
                className="kitButton kitButton--height48 kitButton--neutral"
                onClick={onBack}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="kitButton kitButton--height48 kitButton--primary"
                disabled={!canSubmit}
              >
                {submitState === "submitting" ? "Submitting…" : "Submit report"}
              </button>
            </div>
            <span className="studioReportHomeIndicator" aria-hidden="true" />
          </div>
        </form>
      </div>

      {submitState === "submitting" ? (
        <div className="studioReportToast">
          <Toast status="loading" message="Submitting report" />
        </div>
      ) : null}
      {submitState === "success" ? (
        <div className="studioReportToast">
          <Toast status="success" message="Report submitted" />
        </div>
      ) : null}
    </div>
  );
}

function ReportProfileTypeSection({
  scene,
  objectName,
  options,
  selectedTypes,
  onToggle,
}: {
  scene: Exclude<ReportScene, "general">;
  objectName: string;
  options: string[];
  selectedTypes: string[];
  onToggle: (type: string, selected: boolean) => void;
}) {
  const isProfile = scene === "profile";
  return (
    <fieldset className="studioReportSection studioReportTypeSection">
      <legend>
        <span aria-hidden="true">*</span>{" "}
        {isProfile
          ? "Choose violation profile type"
          : "Choose violation room profile type"}
      </legend>
      <p className="studioReportSectionSubject">
        You are about to report <strong>{objectName}</strong>
      </p>
      <div className="studioReportChoiceList">
        {options.map((option) => {
          const selected = selectedTypes.includes(option);
          return (
            <label
              key={option}
              className={[
                "studioReportChoiceRow",
                selected ? "studioReportChoiceRow--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{option}</span>
              <SelectorButton
                selected={selected}
                aria-label={option}
                onChange={(nextSelected) => onToggle(option, nextSelected)}
              />
            </label>
          );
        })}
      </div>
      <p className="studioReportEvidenceNotice">
        <span>
          {isProfile
            ? "We’ll submit the profile details you select as evidence for review."
            : "We’ll submit the room details you select as evidence for review."}
        </span>
      </p>
    </fieldset>
  );
}
