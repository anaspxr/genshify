/* eslint-disable @typescript-eslint/no-explicit-any */
import { characterAsset } from "genshin-optimizer/assets";
import type {
  ArtifactSlotKey,
  CharacterKey,
  ElementKey,
} from "genshin-optimizer/consts";
import { allArtifactSlotKeys } from "genshin-optimizer/consts";
import type { ICachedArtifact, ICachedCharacter } from "genshin-optimizer/db";
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
  useDatabase,
} from "genshin-optimizer/db-ui";
import { ascensionMaxLevel } from "genshin-optimizer/util";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import {
  Box,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import { ConditionalWrapper } from "genshin-optimizer/ui";
import { Suspense, useCallback, useContext, useMemo } from "react";
import type { CharacterContextObj } from "../../contexts/CharacterContext";
import { CharacterContext } from "../../contexts/CharacterContext";
import type { dataContextObj } from "../../contexts/DataContext";
import { DataContext } from "../../contexts/DataContext";
import { getCharSheet } from "../../libs/GO-files/Data/Characters";
import { uiInput as input } from "../../libs/GO-files/Formula";
import useCharacterReducer from "../../libs/GO-files/ReactHooks/useCharacterReducer";
import useTeamData from "../../libs/GO-files/ReactHooks/useTeamData";
import type { RollColorKey } from "../../libs/GO-files/Types/consts";
import { iconAsset } from "../../libs/GO-files/Util/AssetUtil";
import ArtifactCardPico from "../../libs/GO-files/Components/Artifact/ArtifactCardPico";
import CardLight from "../../libs/GO-files/Components/Card/CardLight";
import { ColorText } from "genshin-optimizer/ui";
import { NodeFieldDisplay } from "../../libs/GO-files/Components/FieldDisplay";
import { SqBadge } from "genshin-optimizer/ui";
import { StarsDisplay } from "../../libs/GO-files/Components/StarDisplay";
import WeaponCardPico from "../../libs/GO-files/Components/Weapon/WeaponCardPico";
type CharacterCardProps = {
  characterKey: CharacterKey;
  onClick?: (characterKey: CharacterKey) => void;
  onClickHeader?: (characterKey: CharacterKey) => void;
  onClickTeammate?: (characterKey: CharacterKey) => void;
  artifactChildren?: Displayable;
  weaponChildren?: Displayable;
  characterChildren?: Displayable;
  footer?: Displayable;
  hideStats?: boolean;
  isTeammateCard?: boolean;
};
export default function CharacterCard({
  characterKey,
  artifactChildren,
  weaponChildren,
  characterChildren,
  onClick,
  onClickHeader,
  footer,
  hideStats,
}: CharacterCardProps) {
  const database = useDatabase();
  const teamData = useTeamData(characterKey);
  const character = useCharacter(characterKey);
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const characterDispatch = useCharacterReducer(characterKey);
  const data = teamData?.[characterKey]?.target;
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
  );
  const actionWrapperFunc = useCallback(
    (children: any) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler]
  );

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character &&
      characterSheet && {
        character,
        characterSheet,
        characterDispatch,
      },
    [character, characterSheet, characterDispatch]
  );
  const dataContextObj: dataContextObj | undefined = useMemo(
    () =>
      data &&
      teamData && {
        data,
        teamData,
      },
    [data, teamData]
  );

  const { favorite } = useCharMeta(characterKey) || {};
  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          width="100%"
          height={hideStats ? 300 : 600}
        />
      }
    >
      <CardLight
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            position: "absolute",
            zIndex: 2,
            opacity: 0.7,
          }}
        >
          <IconButton
            sx={{ p: 0.5 }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onClick={(_) =>
              database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && dataContextObj && characterContextObj && (
            <ExistingCharacterCardContent
              characterContextObj={characterContextObj}
              dataContextObj={dataContextObj}
              characterKey={characterKey}
              onClick={onClick}
              onClickHeader={onClickHeader}
              character={character}
              hideStats={hideStats}
              weaponChildren={weaponChildren}
              artifactChildren={artifactChildren}
              characterChildren={characterChildren}
            />
          )}
        </ConditionalWrapper>
        {footer}
      </CardLight>
    </Suspense>
  );
}

type ExistingCharacterCardContentProps = {
  characterContextObj: CharacterContextObj;
  dataContextObj: dataContextObj;
  characterKey: CharacterKey;
  onClick?: (characterKey: CharacterKey) => void;
  onClickHeader?: (characterKey: CharacterKey) => void;
  isTeammateCard?: boolean;
  character: ICachedCharacter;
  onClickTeammate?: (characterKey: CharacterKey) => void;
  hideStats?: boolean;
  weaponChildren?: Displayable;
  artifactChildren?: Displayable;
  characterChildren?: Displayable;
};
function ExistingCharacterCardContent({
  characterContextObj,
  dataContextObj,
  characterKey,
  onClick,
  onClickHeader,
  character,
  hideStats,
  weaponChildren,
  artifactChildren,
  characterChildren,
}: ExistingCharacterCardContentProps) {
  return (
    <CharacterContext.Provider value={characterContextObj}>
      <DataContext.Provider value={dataContextObj}>
        <Header
          characterKey={characterKey}
          onClick={!onClick ? onClickHeader : undefined}
        >
          <HeaderContent />
        </Header>
        <CardContent
          sx={(theme) => ({
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            flexGrow: 1,
            padding: hideStats ? `${theme.spacing(1)}!important` : undefined,
          })}
        >
          <Artifacts />

          <Grid container columns={4} spacing={0.75}>
            <Grid item xs={1} height="100%">
              <WeaponCardPico weaponId={character.equippedWeapon} />
            </Grid>
          </Grid>
          <Stats />
          {weaponChildren}
          {artifactChildren}
          {characterChildren}
        </CardContent>
      </DataContext.Provider>
    </CharacterContext.Provider>
  );
}

function Header({
  children,
  characterKey,
  onClick,
}: {
  children: JSX.Element;
  characterKey: CharacterKey;
  onClick?: (characterKey: CharacterKey) => void;
}) {
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);

  const actionWrapperFunc = useCallback(
    (children: any) => (
      <CardActionArea
        onClick={() => characterKey && onClick?.(characterKey)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </CardActionArea>
    ),
    [onClick, characterKey]
  );
  const banner = characterAsset(characterKey, "banner", gender);
  if (!characterSheet) return null;
  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <Box
        display="flex"
        position="relative"
        className={!banner ? `grad-${characterSheet.rarity}star` : undefined}
        sx={{
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            opacity: 0.7,
            backgroundImage: `url(${banner})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          },
        }}
        width="100%"
      >
        <Box
          flexShrink={1}
          component="img"
          src={iconAsset(characterKey, gender)}
          sx={{ maxWidth: "40%" }}
          alignSelf="flex-end"
          display="flex"
          flexDirection="column"
          zIndex={1}
        />
        <Box
          flexGrow={1}
          sx={{ py: 1, pr: 1 }}
          display="flex"
          flexDirection="column"
          zIndex={1}
          justifyContent="space-between"
        >
          {children}
        </Box>
      </Box>
    </ConditionalWrapper>
  );
}

function HeaderContent() {
  const { characterSheet } = useContext(CharacterContext);
  const { data } = useContext(DataContext);
  const characterEle = data.get(input.charEle).value as ElementKey;
  const characterLevel = data.get(input.lvl).value;
  const constellation = data.get(input.constellation).value;
  const ascension = data.get(input.asc).value;
  const autoBoost = data.get(input.total.autoBoost).value;
  const skillBoost = data.get(input.total.skillBoost).value;
  const burstBoost = data.get(input.total.burstBoost).value;

  const tAuto = data.get(input.total.auto).value;
  const tSkill = data.get(input.total.skill).value;
  const tBurst = data.get(input.total.burst).value;

  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">{characterSheet.name}</Typography>
        }
        size="small"
        color={characterEle}
        sx={{ opacity: 0.85 }}
      />
      <Box
        display="flex"
        gap={1}
        sx={{ textShadow: "0 0 5px gray" }}
        alignItems="center"
      >
        <Box>
          <Typography component="span" variant="h6" whiteSpace="nowrap">
            Lv. {characterLevel}
          </Typography>
          <Typography component="span" variant="h6" color="text.secondary">
            /{ascensionMaxLevel[ascension]}
          </Typography>
        </Box>
        <Typography component="span" whiteSpace="nowrap" sx={{ opacity: 0.85 }}>
          <SqBadge
            color={
              `roll${constellation < 3 ? 3 : constellation}` as RollColorKey
            }
          >
            <ColorText color="white">
              <strong>C{constellation}</strong>
            </ColorText>
          </SqBadge>
        </Typography>
      </Box>
      <Box display="flex" gap={1} sx={{ opacity: 0.85 }}>
        <Chip
          size="small"
          color={autoBoost ? "info" : "secondary"}
          label={<strong>{tAuto}</strong>}
        />
        <Chip
          size="small"
          color={skillBoost ? "info" : "secondary"}
          label={<strong>{tSkill}</strong>}
        />
        <Chip
          size="small"
          color={burstBoost ? "info" : "secondary"}
          label={<strong>{tBurst}</strong>}
        />
      </Box>
      <Typography variant="h6" lineHeight={1}>
        <StarsDisplay stars={characterSheet.rarity} colored inline />
      </Typography>
    </>
  );
}

function Artifacts() {
  const database = useDatabase();
  const { data } = useContext(DataContext);
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((k) => [
        k,
        database.arts.get(data.get(input.art[k].id).value?.toString() ?? ""),
      ]),
    [data, database]
  ) as Array<[ArtifactSlotKey, ICachedArtifact | undefined]>;

  return (
    <Grid direction="row" container spacing={0.75} columns={5}>
      {artifacts.map(
        ([key, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => (
          <Grid item key={key} xs={1}>
            <ArtifactCardPico artifactObj={art} slotKey={key} />
          </Grid>
        )
      )}
    </Grid>
  );
}

function Stats() {
  const { data } = useContext(DataContext);
  return (
    <Box sx={{ width: "100%" }}>
      {Object.values(data.getDisplay().basic).map((n) => (
        <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
      ))}
      {data.get(input.special).info.name && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography flexGrow={1}>
            <strong>Specialized:</strong>
          </Typography>
          {data.get(input.special).info.icon}
          <Typography>{data.get(input.special).info.name}</Typography>
        </Box>
      )}
    </Box>
  );
}
