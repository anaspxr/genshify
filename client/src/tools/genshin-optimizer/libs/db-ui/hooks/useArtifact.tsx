import { useDataManagerBase } from "genshin-optimizer/database-ui";
import { useDatabase } from "./useDatabase";

export function useArtifact(artifactID: string | undefined = "") {
  const database = useDatabase();
  return useDataManagerBase(database.arts, artifactID);
}
