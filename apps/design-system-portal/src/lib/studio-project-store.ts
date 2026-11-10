import "server-only";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  STUDIO_PROJECT_IDS,
  isStudioProjectId,
  type StudioProjectId,
} from "./studio-project-catalog";

type StudioProjectState = {
  schemaVersion: 1;
  activeProjectIds: StudioProjectId[];
};

const STATE_PATH = path.join(process.cwd(), "data", "studio-projects.json");

export async function readStudioProjectState(): Promise<StudioProjectState> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    const value = JSON.parse(raw) as Partial<StudioProjectState>;
    if (!Array.isArray(value.activeProjectIds)) {
      return defaultState();
    }
    return {
      schemaVersion: 1,
      activeProjectIds: value.activeProjectIds.filter(
        (id): id is StudioProjectId =>
          typeof id === "string" && isStudioProjectId(id),
      ),
    };
  } catch {
    return defaultState();
  }
}

export async function removeStudioProject(projectId: StudioProjectId) {
  const state = await readStudioProjectState();
  if (!state.activeProjectIds.includes(projectId)) {
    return { removed: false, state };
  }

  const next: StudioProjectState = {
    schemaVersion: 1,
    activeProjectIds: state.activeProjectIds.filter((id) => id !== projectId),
  };
  await writeFile(STATE_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return { removed: true, state: next };
}

function defaultState(): StudioProjectState {
  return {
    schemaVersion: 1,
    activeProjectIds: [...STUDIO_PROJECT_IDS],
  };
}
