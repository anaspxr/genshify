import { useForceUpdate, useMediaQueryUp } from "genshin-optimizer/react-util";
import { clamp, filterFunction, sortFunction } from "genshin-optimizer/util";
import {
  allCharacterRarityKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from "genshin-optimizer/consts";
import { useDatabase } from "genshin-optimizer/db-ui";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  TextField,
} from "@mui/material";
import type { ChangeEvent } from "react";
import React, {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CardDark from "../../../libs/GO-files/Components/Card/CardDark";
import CharacterCard from "../../../libs/GO-files/Components/Character/CharacterCard";
import PageAndSortOptionSelect from "../../../libs/GO-files/Components/PageAndSortOptionSelect";
import CharacterRarityToggle from "../../../libs/GO-files/Components/ToggleButton/CharacterRarityToggle";
import ElementToggle from "../../../libs/GO-files/Components/ToggleButton/ElementToggle";
import WeaponToggle from "../../../libs/GO-files/Components/ToggleButton/WeaponToggle";
import { getCharSheet } from "../../../libs/GO-files/Data/Characters";
import { getWeaponSheet } from "../../../libs/GO-files/Data/Weapons";
import useCharSelectionCallback from "../../../libs/GO-files/ReactHooks/useCharSelectionCallback";
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from "../../../libs/GO-files/Util/CharacterSort";
import { catTotal } from "../../../libs/GO-files/Util/totalUtils";
const CharacterSelectionModal = React.lazy(
  () => import("./CharacterSelectionModal")
);
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 };
const numToShowMap = { xs: 6, sm: 8, md: 12, lg: 16, xl: 16 };

export default function PageCharacter() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const invScrollRef = useRef<HTMLDivElement>(null);
  const setPage = useCallback(
    (_: ChangeEvent<unknown>, value: number) => {
      invScrollRef.current?.scrollIntoView({ behavior: "smooth" });
      database.displayCharacter.set({ pageIndex: value - 1 });
    },
    [database, invScrollRef]
  );

  const brPt = useMediaQueryUp();
  const maxNumToDisplay = numToShowMap[brPt];

  const [newCharacter, setnewCharacter] = useState(false);
  const [dbDirty, forceUpdate] = useForceUpdate();
  // Set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/characters" });
    return database.chars.followAny(
      (_k, r) => (r === "new" || r === "remove") && forceUpdate()
    );
  }, [forceUpdate, database]);

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny(() => forceUpdate()),
    [forceUpdate, database]
  );
  const editCharacter = useCharSelectionCallback();
  const deferredState = useDeferredValue(state);
  const deferredDbDirty = useDeferredValue(dbDirty);
  const { charKeyList, totalCharNum } = useMemo(() => {
    const chars = database.chars.keys;
    const totalCharNum = chars.length;
    const { element, weaponType, rarity, sortType, ascending } = deferredState;
    const charKeyList = database.chars.keys
      .filter(
        filterFunction(
          { element, weaponType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(
          characterSortMap[sortType] ?? [],
          ascending,
          characterSortConfigs(database),
          ["new", "favorite"]
        )
      );
    return deferredDbDirty && { charKeyList, totalCharNum };
  }, [database, deferredState, deferredSearchTerm, deferredDbDirty]);

  const { weaponType, element, rarity, pageIndex = 0 } = state;

  const { charKeyListToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay);
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1);
    return {
      charKeyListToShow: charKeyList.slice(
        currentPageIndex * maxNumToDisplay,
        (currentPageIndex + 1) * maxNumToDisplay
      ),
      numPages,
      currentPageIndex,
    };
  }, [charKeyList, pageIndex, maxNumToDisplay]);

  const totalShowing =
    charKeyList.length !== totalCharNum
      ? `${charKeyList.length}/${totalCharNum}`
      : `${totalCharNum}`;

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const weapon = database.weapons.get(char.equippedWeapon);
          if (!weapon) return;
          const wtk = getWeaponSheet(weapon.key).weaponType;
          ct[wtk].total++;
          if (charKeyList.includes(ck)) ct[wtk].current++;
        })
      ),
    [database, charKeyList]
  );

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const eleKey = getCharSheet(char.key, database.gender).elementKey;
          ct[eleKey].total++;
          if (charKeyList.includes(ck)) ct[eleKey].current++;
        })
      ),
    [database, charKeyList]
  );

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const eleKey = getCharSheet(char.key, database.gender).rarity;
          ct[eleKey as keyof typeof ct].total++;
          if (charKeyList.includes(ck)) ct[eleKey as keyof typeof ct].current++;
        })
      ),
    [database, charKeyList]
  );

  const paginationProps = {
    count: numPages,
    page: currentPageIndex + 1,
    onChange: setPage,
  };

  const showingTextProps = {
    numShowing: charKeyListToShow.length,
    total: totalShowing,
    t: t,
    namespace: "page_character",
  };

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          newFirst
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={editCharacter}
        />
      </Suspense>
      <CardDark ref={invScrollRef}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Grid container spacing={1}>
            <Grid item>
              <WeaponToggle
                sx={{ height: "100%" }}
                onChange={(weaponType) =>
                  database.displayCharacter.set({ weaponType })
                }
                value={weaponType}
                totals={weaponTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <ElementToggle
                sx={{ height: "100%" }}
                onChange={(element) =>
                  database.displayCharacter.set({ element })
                }
                value={element}
                totals={elementTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <CharacterRarityToggle
                sx={{ height: "100%" }}
                onChange={(rarity) => database.displayCharacter.set({ rarity })}
                value={rarity}
                totals={rarityTotals}
                size="small"
              />
            </Grid>
            <Grid item flexGrow={1} />
            <Grid item>
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
            </Grid>
          </Grid>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            flexWrap="wrap"
          >
            <PageAndSortOptionSelect
              paginationProps={paginationProps}
              showingTextProps={showingTextProps}
              displaySort={true}
            />
          </Box>
        </CardContent>
      </CardDark>
      <Button
        fullWidth
        onClick={() => setnewCharacter(true)}
        color="info"
        startIcon={<AddIcon />}
      >{t`addNew`}</Button>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: "100%", height: "100%", minHeight: 5000 }}
          />
        }
      >
        <CharacterContent />
      </Suspense>
      {numPages > 1 && (
        <CardDark>
          <CardContent sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
            <Button
              onClick={() => setnewCharacter(true)}
              color="info"
              sx={{ minWidth: 0 }}
            >
              <AddIcon />
            </Button>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              flexGrow={1}
            >
              <PageAndSortOptionSelect
                paginationProps={paginationProps}
                showingTextProps={showingTextProps}
              />
            </Box>
          </CardContent>
        </CardDark>
      )}
    </Box>
  );
}

export function CharacterContent() {
  const database = useDatabase();
  const [state, setState] = useState(() => database.displayCharacter.get());
  useEffect(
    () => database.displayCharacter.follow((_r, s) => setState(s)),
    [database, setState]
  );
  const [searchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const brPt = useMediaQueryUp();
  const maxNumToDisplay = numToShowMap[brPt];

  const [dbDirty, forceUpdate] = useForceUpdate();
  // Set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/characters" });
    return database.chars.followAny(
      (_k, r) => (r === "new" || r === "remove") && forceUpdate()
    );
  }, [forceUpdate, database]);

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny(() => forceUpdate()),
    [forceUpdate, database]
  );

  const navigate = useNavigate();

  const deferredState = useDeferredValue(state);
  const deferredDbDirty = useDeferredValue(dbDirty);
  const { charKeyList } = useMemo(() => {
    const chars = database.chars.keys;
    const totalCharNum = chars.length;
    const { element, weaponType, rarity, sortType, ascending } = deferredState;
    const charKeyList = database.chars.keys
      .filter(
        filterFunction(
          { element, weaponType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(
          characterSortMap[sortType] ?? [],
          ascending,
          characterSortConfigs(database),
          ["new", "favorite"]
        )
      );
    return deferredDbDirty && { charKeyList, totalCharNum };
  }, [database, deferredState, deferredSearchTerm, deferredDbDirty]);

  const { pageIndex = 0 } = state;

  const { charKeyListToShow } = useMemo(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay);
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1);
    return {
      charKeyListToShow: charKeyList.slice(
        currentPageIndex * maxNumToDisplay,
        (currentPageIndex + 1) * maxNumToDisplay
      ),
      numPages,
      currentPageIndex,
    };
  }, [charKeyList, pageIndex, maxNumToDisplay]);

  return (
    <div>
      {" "}
      {!charKeyListToShow.length && (
        <Button
          style={{
            margin: "10px auto",
          }}
          // reloads the page to show the updated data // ? this is a temporary solution
          // todo: find a way to update the data without reloading the page
          onClick={() => window.location.reload()}
        >
          Reload page to see showcase
        </Button>
      )}
      <Grid container spacing={1} columns={columns}>
        {charKeyListToShow.map((charKey) => (
          <Grid item key={charKey} xs={1}>
            <CharacterCard
              characterKey={charKey}
              onClick={() => navigate(`${charKey}`)}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
