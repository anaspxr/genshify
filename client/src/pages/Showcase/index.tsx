import { useState } from "react";
import { PlayerData, Wrapper } from "../../enka";
import { generateGoodData } from "genshin-optimizer/good/goodDataMaker";
import { CacheHandler } from "../../enka/handlers/CacheHandler";
import { useDataStore } from "../../utils/DataStore";
import { CharacterContent } from "./ShowcaseList";
import {
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Container from "@mui/material/Container";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Tooltip from "@mui/material/Tooltip";
import HelpIcon from "@mui/icons-material/Help";
import Grid from "@mui/material/Grid";
export default function Showcase() {
  const [isLoading, setIsLoading] = useState(false);
  const dataStore = useDataStore();
  const [errorMessage, setErrorMessage] = useState(false);
  const [playerDetails, setPlayerDetails] = useState<PlayerData>();
  const cache = new CacheHandler();

  const searchPlayer = async () => {
    try {
      setIsLoading(true);
      const uid = (document.getElementById("uidInput") as HTMLInputElement)
        .value;

      // ? gets the character details from enka api
      const { genshin } = new Wrapper();
      await genshin
        .getPlayer(uid)
        .then((player) => {
          if (
            JSON.stringify(player) ===
            JSON.stringify({
              player: {},
              characters: [],
              owner: {},
              handler: {},
              language: "en",
            })
          ) {
            console.log("no data");
            setErrorMessage(true);
            return; // Exit the function if no data
          }
          setPlayerDetails(player); // Set playerDetails
          cache.set("cacheData", player); //set Cache data into local storage
          try {
            // ? stores the data into the database
            const playerData = generateGoodData(player);
            dataStore(playerData, 1, false, true);
          } catch (error) {
            console.error("Error updating database:", error);
          }
        })
        .catch((err) => console.log(err));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  // ? gets the cached data from the local storage and sets it to the state
  if (playerDetails === undefined) {
    const cachedData = cache.get("cacheData");
    if (cachedData) {
      setPlayerDetails(cachedData);
    }
  }

  const [jsonData, setJsonData] = useState<string>("");
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Stack spacing={2} useFlexGap sx={{ width: { xs: "100%", sm: "70%" } }}>
        <Typography
          component="span"
          variant="h3"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignSelf: "center",
            textAlign: "center",
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Character Showcase
        </Typography>

        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ alignSelf: "center", width: { sm: "100%", md: "80%" } }}
        >
          Genshin Character showcase to view your own in-game characters with
          detailed information. Including damage numbers and build guides
          too..!!
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignSelf="center"
          spacing={1}
          useFlexGap
          sx={{ pt: 2, width: { xs: "100%", sm: "auto" } }}
        >
          <TextField
            id="uidInput"
            hiddenLabel
            size="small"
            variant="outlined"
            aria-label="Enter your email address"
            placeholder="Enter your genshin uid"
          />
          <Button
            onClick={searchPlayer}
            disabled={isLoading}
            variant="contained"
            color="primary"
          >
            {isLoading ? "Updating..." : "Search"}
          </Button>
        </Stack>
        <Typography variant="caption" textAlign="center" sx={{ opacity: 0.8 }}>
          Search your UID to show your characters..
        </Typography>
        {/*test Uid: 825436941 840889067  801669600*/}
      </Stack>
      {/* characters showcase section */}
      {errorMessage && <div>Sorry, some error occured..</div>}
      {playerDetails && (
        <div>
          <h1>{playerDetails.player.username}'s Characters</h1>
          <div className="charSideIconContainer">
            <Grid container justifyContent="center" sx={{ m: 1, opacity: 0.6 }}>
              {playerDetails.characters.map((character, index) => (
                <Grid item key={index}>
                  <img
                    src={`https://enka.network/ui/${character.assets.sideIcon}.png`}
                    alt={character.name}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
          <CharacterContent />
        </div>
      )}

      {playerDetails && (
        <div
          style={{
            marginTop: "20px",
            marginRight: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Button
              href="https://frzyc.github.io/genshin-optimizer/#/setting"
              target="_blank"
            >
              Genshin Optimizer
              <OpenInNewIcon
                style={{
                  marginLeft: "5px",
                  fontSize: "20px",
                }}
              />
            </Button>
            {!jsonData ? (
              <Button
                onClick={() => setJsonData(generateGoodData(playerDetails))}
              >
                Generate GOOD data{" "}
              </Button>
            ) : (
              <Button
                id="copy"
                onClick={() => {
                  // ? copies the json data to the clipboard
                  navigator.clipboard.writeText(jsonData);
                  const copyBtn = document.getElementById("copy");
                  if (copyBtn) copyBtn.textContent = "Copied to Clipboard";
                }}
              >
                Copy GOOD Data
              </Button>
            )}
            <Tooltip title="Genshin Open Object Description (GOOD).You can use this in Genshin Optimizer to get more and accurate information about your characters.">
              <IconButton sx={{}}>
                <HelpIcon
                  sx={{
                    stroke: "black",
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>

          {jsonData && (
            <textarea
              disabled
              rows={20}
              value={jsonData}
              className="jsonField"
            ></textarea>
          )}
        </div>
      )}
    </Container>
  );
}
