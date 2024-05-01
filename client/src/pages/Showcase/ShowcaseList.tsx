import { useForceUpdate, useMediaQueryUp } from "genshin-optimizer/react-util";
import { clamp, filterFunction, sortFunction } from "genshin-optimizer/util";
import { useDatabase } from "genshin-optimizer/db-ui";
import { Button, Grid } from "@mui/material";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import ReactGA from "react-ga4";
import { useNavigate } from "react-router-dom";
import CharacterCard from "./CharacterCard";
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from "../../libs/GO-files/Util/CharacterSort";
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 };
const numToShowMap = { xs: 8, sm: 8, md: 12, lg: 16, xl: 16 };

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
