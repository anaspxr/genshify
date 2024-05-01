import type { CharacterKey } from "genshin-optimizer/consts";
import { useCharacter, useDBMeta, useDatabase } from "genshin-optimizer/db-ui";
import { Box, CardContent, Skeleton } from "@mui/material";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CardThemed } from "genshin-optimizer/ui";
import CloseButton from "../../../libs/GO-files/Components/CloseButton";
import {
  HitModeToggle,
  InfusionAuraDropdown,
  ReactionToggle,
} from "../../../libs/GO-files/Components/HitModeEditor";
import LevelSelect from "../../../libs/GO-files/Components/LevelSelect";
import type { CharacterContextObj } from "../../../contexts/CharacterContext";
import { CharacterContext } from "../../../contexts/CharacterContext";
import type { dataContextObj } from "../../../contexts/DataContext";
import { DataContext } from "../../../contexts/DataContext";
import type {
  ChartData,
  GraphContextObj,
} from "../../../contexts/GraphContext";
import { GraphContext } from "../../../contexts/GraphContext";
import { getCharSheet } from "../../../libs/GO-files/Data/Characters";
import useCharacterReducer from "../../../libs/GO-files/ReactHooks/useCharacterReducer";
import useTeamData from "../../../libs/GO-files/ReactHooks/useTeamData";
import useTitle from "../../../libs/GO-files/ReactHooks/useTitle";
import TabOverview from "./CharacterStats";

export default function CharacterDisplay() {
  const navigate = useNavigate();
  const database = useDatabase();
  const onClose = useCallback(() => navigate("/showcase"), [navigate]);
  const { characterKey } = useParams<{ characterKey?: CharacterKey }>();
  const invalidKey = !database.chars.keys.includes(
    characterKey as CharacterKey
  );
  if (invalidKey) return <Navigate to="/showcase" />;

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && (
          <CharacterDisplayCard
            key={characterKey}
            characterKey={characterKey}
            onClose={onClose}
          />
        )}
      </Suspense>
    </Box>
  );
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey;
  onClose?: () => void;
};
function CharacterDisplayCard({
  characterKey,
  onClose,
}: CharacterDisplayCardProps) {
  const character = useCharacter(characterKey);
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const teamData = useTeamData(characterKey);
  const { target: charUIData } = teamData?.[characterKey] ?? {};
  useTitle(`${characterKey} Stats`);
  const characterDispatch = useCharacterReducer(character?.key ?? "");
  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined;
    return {
      data: charUIData,
      teamData,
      oldData: undefined,
    };
  }, [charUIData, teamData]);

  const characterContextValue: CharacterContextObj | undefined = useMemo(() => {
    if (!character || !characterSheet) return undefined;
    return {
      character,
      characterSheet,
      characterDispatch,
    };
  }, [character, characterSheet, characterDispatch]);

  const [chartData, setChartData] = useState(
    undefined as ChartData | undefined
  );
  const [graphBuilds, setGraphBuilds] = useState<string[][]>();
  const graphContextValue: GraphContextObj | undefined = useMemo(() => {
    return {
      chartData,
      setChartData,
      graphBuilds,
      setGraphBuilds,
    };
  }, [chartData, graphBuilds]);

  // Clear state when switching characters
  useEffect(() => {
    setChartData(undefined);
    setGraphBuilds(undefined);
  }, [characterKey]);

  return (
    <CardThemed>
      {dataContextValue && characterContextValue && graphContextValue ? (
        <CharacterContext.Provider value={characterContextValue}>
          <DataContext.Provider value={dataContextValue}>
            <GraphContext.Provider value={graphContextValue}>
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Box display="flex">
                  <Box
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    flexGrow={1}
                  ></Box>
                  {!!onClose && <CloseButton onClick={onClose} />}
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {character && (
                    <LevelSelect
                      level={character.level}
                      ascension={character.ascension}
                      setBoth={characterDispatch}
                    />
                  )}
                  <HitModeToggle size="small" />
                  <InfusionAuraDropdown />
                  <ReactionToggle size="small" />
                </Box>
                <TabOverview />
              </CardContent>
            </GraphContext.Provider>
          </DataContext.Provider>
        </CharacterContext.Provider>
      ) : (
        <Skeleton variant="rectangular" width="100%" height={1000} />
      )}
    </CardThemed>
  );
}
