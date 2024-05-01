/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBoolState, useForceUpdate } from "genshin-optimizer/react-util";
import { filterFunction, sortFunction } from "genshin-optimizer/util";
import { characterAsset } from "genshin-optimizer/assets";
import type { CharacterKey } from "genshin-optimizer/consts";
import {
  allCharacterKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from "genshin-optimizer/consts";
import type { ICachedCharacter } from "genshin-optimizer/db";
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
  useDatabase,
} from "genshin-optimizer/db-ui";
import { ascensionMaxLevel } from "genshin-optimizer/util";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import type { TooltipProps } from "@mui/material";
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  styled,
  tooltipClasses,
} from "@mui/material";
import type { ChangeEvent } from "react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import CardDark from "../../../libs/GO-files/Components/Card/CardDark";
import CardLight from "../../../libs/GO-files/Components/Card/CardLight";
import CharacterCard from "../../../libs/GO-files/Components/Character/CharacterCard";
import CloseButton from "../../../libs/GO-files/Components/CloseButton";
import ModalWrapper from "../../../libs/GO-files/Components/ModalWrapper";
import { SqBadge } from "genshin-optimizer/ui";

import { StarsDisplay } from "../../../libs/GO-files/Components/StarDisplay";
import ElementToggle from "../../../libs/GO-files/Components/ToggleButton/ElementToggle";
import WeaponToggle from "../../../libs/GO-files/Components/ToggleButton/WeaponToggle";
import { DataContext } from "../../../contexts/DataContext";
import { getCharSheet } from "../../../libs/GO-files/Data/Characters";
import type CharacterSheet from "../../../libs/GO-files/Data/Characters/CharacterSheet";
import { iconAsset } from "../../../libs/GO-files/Util/AssetUtil";
import type { CharacterSortKey } from "../../../libs/GO-files/Util/CharacterSort";
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from "../../../libs/GO-files/Util/CharacterSort";
import { catTotal } from "../../../libs/GO-files/Util/totalUtils";

type characterFilter = (
  character: ICachedCharacter | undefined,
  sheet: CharacterSheet
) => boolean;

type CharacterSelectionModalProps = {
  show: boolean;
  newFirst?: boolean;
  onHide: () => void;
  onSelect?: (ckey: CharacterKey) => void;
  filter?: characterFilter;
};
export default function CharacterSelectionModal({
  show,
  onHide,
  onSelect,
  filter = () => true,
  newFirst = false,
}: CharacterSelectionModalProps) {
  const { t } = useTranslation([
    "page_character",
    // Always load these 2 so character names are loaded for searching/sorting
    "charNames_gen",
  ]);
  const database = useDatabase();
  const [state, setState] = useState(() => database.displayCharacter.get());
  useEffect(
    () => database.displayCharacter.follow((_r, s) => setState(s)),
    [database, setState]
  );

  const { gender } = useDBMeta();

  const [dbDirty, forceUpdate] = useForceUpdate();

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny(() => forceUpdate()),
    [forceUpdate, database]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredState = useDeferredValue(state);
  const deferredDbDirty = useDeferredValue(dbDirty);
  const characterKeyList = useMemo(() => {
    const { element, weaponType, sortType, ascending } = deferredState;
    const sortByKeys = [
      ...(newFirst ? ["new"] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[];
    return (
      deferredDbDirty &&
      allCharacterKeys
        .filter((key) =>
          filter(database.chars.get(key), getCharSheet(key, gender))
        )
        .filter(
          filterFunction(
            { element, weaponType, name: deferredSearchTerm },
            characterFilterConfigs(database)
          )
        )
        .sort(
          sortFunction(
            sortByKeys,
            ascending,
            characterSortConfigs(database),
            ["new", "favorite"]
          )
        )
    );
  }, [
    deferredState,
    newFirst,
    deferredDbDirty,
    deferredSearchTerm,
    database,
    filter,
    gender,
  ]);

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const wtk = getCharSheet(ck, database.gender).weaponTypeKey;
          ct[wtk].total++;
          if (characterKeyList.includes(ck)) ct[wtk].current++;
        })
      ),
    [characterKeyList, database]
  );

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const ele = getCharSheet(ck, database.gender).elementKey;
          ct[ele].total++;
          if (characterKeyList.includes(ck)) ct[ele].current++;
        })
      ),
    [characterKeyList, database]
  );

  const { weaponType, element} = state;

  return (
    <ModalWrapper
      open={show}
      onClose={onHide}
      sx={{ "& .MuiContainer-root": { justifyContent: "normal" } }}
    >
      <CardDark>
        <CardContent
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <WeaponToggle
            sx={{ height: "100%" }}
            onChange={(weaponType) =>
              database.displayCharacter.set({ weaponType })
            }
            value={weaponType}
            totals={weaponTotals}
            size="small"
          />
          <ElementToggle
            sx={{ height: "100%" }}
            onChange={(element) => database.displayCharacter.set({ element })}
            value={element}
            totals={elementTotals}
            size="small"
          />
          <Box flexGrow={1}>
            <TextField
              autoFocus
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setSearchTerm(e.target.value)
              }
              label={t("characterName")}
              size="small"
              sx={{ height: "100%" }}
              InputProps={{
                sx: { height: "100%" },
              }}
            />
          </Box>
          <CloseButton onClick={onHide} />
        </CardContent>
        <Divider />
        <DataContext.Provider value={{ teamData: undefined } as any}>
          <CardContent>
            <Grid
              container
              spacing={1}
              columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
            >
              {characterKeyList.map((characterKey) => (
                <Grid item key={characterKey} xs={1}>
                  <SelectionCard
                    characterKey={characterKey}
                    onClick={() => {
                      onHide();
                      onSelect?.(characterKey);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </DataContext.Provider>
      </CardDark>
    </ModalWrapper>
  );
}

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
  },
});

function SelectionCard({
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey;
  onClick: () => void;
}) {
  const { gender } = useDBMeta();
  const characterSheet = getCharSheet(characterKey, gender);
  const character = useCharacter(characterKey);
  const { favorite } = useCharMeta(characterKey) || {};
  const database = useDatabase();
  const [open, onOpen, onClose] = useBoolState();

  const { level = 1, ascension = 0, constellation = 0 } = character ?? {};
  const banner = characterAsset(characterKey, "banner", gender);
  return (
    <CustomTooltip
      enterDelay={300}
      enterNextDelay={300}
      arrow
      placement="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      title={
        <Box sx={{ width: 300 }}>
          <CharacterCard hideStats characterKey={characterKey} />
        </Box>
      }
    >
      <Box>
        <CardLight
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ position: "absolute", opacity: 0.7, zIndex: 2 }}>
            <IconButton
              sx={{ p: 0.25 }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onClick={(_) => {
                onClose();
                database.charMeta.set(characterKey, { favorite: !favorite });
              }}
            >
              {favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>
          <CardActionArea onClick={onClick}>
            <Box
              display="flex"
              position="relative"
              className={
                !banner ? `grad-${characterSheet?.rarity}star` : undefined
              }
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
                sx={{ maxWidth: { xs: "33%", lg: "30%" } }}
                alignSelf="flex-end"
                display="flex"
                flexDirection="column"
                zIndex={1}
              >
                <Box
                  component="img"
                  src={iconAsset(characterKey, gender)}
                  width="100%"
                  height="auto"
                  maxWidth={256}
                  sx={{ mt: "auto" }}
                />
              </Box>
              <Box
                flexGrow={1}
                sx={{ pr: 1, pt: 1 }}
                display="flex"
                flexDirection="column"
                zIndex={1}
                justifyContent="space-evenly"
              >
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  <SqBadge
                    color={characterSheet?.elementKey}
                    sx={{ opacity: 0.85, textShadow: "0 0 5px gray" }}
                  >
                    {characterSheet?.name}
                  </SqBadge>
                </Typography>
                {character ? (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Box sx={{ textShadow: "0 0 5px gray" }}>
                      <Typography
                        variant="body2"
                        component="span"
                        whiteSpace="nowrap"
                      >
                        Lv. {level}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        color="text.secondary"
                      >
                        /{ascensionMaxLevel[ascension]}
                      </Typography>
                    </Box>
                    <Typography variant="body2">C{constellation}</Typography>
                  </Box>
                ) : (
                  <Typography component="span" variant="body2">
                    <SqBadge>NEW</SqBadge>
                  </Typography>
                )}
                <StarsDisplay stars={characterSheet?.rarity ?? 1} colored />
              </Box>
            </Box>
          </CardActionArea>
        </CardLight>
      </Box>
    </CustomTooltip>
  );
}
