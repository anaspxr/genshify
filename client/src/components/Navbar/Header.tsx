import { Link, useMatch } from "react-router-dom";
import logo from "../../assets/images/logo/Genshify_logo_for_Light.png";
import { Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Skeleton,
  Tab,
  Tabs,
  Toolbar,
} from "@mui/material";
import Container from "@mui/material/Container";
import { Suspense, useState } from "react";
import { SnowToggle } from "../Effects/PrimoToggle";
import TuneIcon from "@mui/icons-material/Tune";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { useThemeContext } from "../../contexts/ThemeContext";
import {
  cryoTheme,
  dendroTheme,
  hydroTheme,
  pyroTheme,
  electroTheme,
  geoTheme,
  anemoTheme,
  darkTheme,
} from "genshin-optimizer/ui";
type ITab = {
  to: string;
  value: string;
  name: string;
};

const home: ITab = {
  to: "/",
  value: "home",
  name: "Home",
};

const banner: ITab = {
  to: "/#banner",
  value: "banner",
  name: "Banner",
};
const events: ITab = {
  to: "/#events",
  value: "events",
  name: "Events",
};
const guides: ITab = {
  to: "/#guides",
  value: "guides",
  name: "Guides",
};
const showcase: ITab = {
  to: "/showcase",
  value: "showcase",
  name: "Showcase",
};

const content = [home, guides, banner, events, showcase] as const;
export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={56} />}>
      <HeaderContent anchor={anchor} />
      {/* <SnowToggle /> */}
    </Suspense>
  );
}

function Settings() {
  const { changeTheme, swiperIndex } = useThemeContext();
  const themes = {
    dendro: { theme: dendroTheme, index: 0 },
    electro: { theme: electroTheme, index: 1 },
    anemo: { theme: anemoTheme, index: 2 },
    pyro: { theme: pyroTheme, index: 3 },
    hydro: { theme: hydroTheme, index: 4 },
    cryo: { theme: cryoTheme, index: 5 },
    geo: { theme: geoTheme, index: 6 },
    dark: { theme: darkTheme, index: 7 },
  };
  const themeOptions = {
    dendro: {
      value: "dendro",
      label: "Dendro Theme",
    },
    electro: {
      value: "electro",
      label: "Electro Theme",
    },
    anemo: {
      value: "anemo",
      label: "Anemo Theme",
    },
    pyro: {
      value: "pyro",
      label: "Pyro Theme",
    },
    hydro: {
      value: "hydro",
      label: "Hydro Theme",
    },
    cryo: {
      value: "cryo",
      label: "Cryo Theme",
    },
    geo: {
      value: "geo",
      label: "Geo Theme",
    },
  };
  const [value, setValue] = useState(
    themeOptions[Object.keys(themeOptions)[swiperIndex]].value
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = (event.target as HTMLInputElement).value;
    const selectedTheme =
      themes[newValue as keyof typeof themes] || themes.dendro;
    setValue(newValue);
    changeTheme(selectedTheme.theme, selectedTheme.index);
  };
  return (
    <div
      style={{
        maxWidth: "200px",
      }}
    >
      <FormControl
        sx={{
          padding: "10px",
        }}
      >
        <FormLabel id="demo-radio-buttons-group-label">Theme</FormLabel>
        <RadioGroup
          aria-labelledby="Select theme"
          defaultValue="geo"
          name="theme"
          value={value}
          onChange={handleChange}
        >
          <FormControlLabel
            value="elemental"
            control={<Radio />}
            label="Elemental"
          />
          {Object.values(themeOptions).map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              sx={{
                color: `${option.value}.main`,
              }}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Divider />
      <br />
      <SnowToggle />
      <br />
      <Divider />
    </div>
  );
}

function HeaderContent({ anchor }: { anchor: string }) {
  const {
    params: { currentTab },
  } = useMatch({ path: "/:currentTab", end: false }) ?? {
    params: { currentTab: "home" },
  };

  //? Drawer for settings
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          mt: 1,
        }}
        id={anchor}
      >
        <Container maxWidth="xl">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderRadius: "20px",
              bgcolor:
                theme.palette.mode !== "dark"
                  ? "rgba(255, 255, 255, 0.4)"
                  : "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(24px)",
              maxHeight: 40,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode !== "dark"
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
            })}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ml: "-18px",
                px: 0,
              }}
            >
              <Link to={"/"}>
                <img
                  src={logo}
                  style={{
                    width: "80px",
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  alt="Genshify"
                />
              </Link>
            </Box>
            <Tabs
              centered
              value={currentTab === "characters" ? "showcase" : currentTab}
              sx={{
                display: { xs: "none", sm: "flex" },
                "& .MuiTab-root": {
                  p: 1,
                  minWidth: "auto",
                  height: "10px",
                  textTransform: "none",
                  fontSize: "1rem",
                  borderRadius: "5px",
                },
                "& .MuiTab-root:hover": {
                  transition: "background-color 0.5s ease",
                  bgcolor: "primary.light",
                },
              }}
            >
              {content.map(({ to, value, name }) => {
                if (value === "character") return null;
                return (
                  <Tab
                    onClick={() => {
                      if (to.includes("#")) {
                        scrollToSection(`${value}`);
                      }
                    }}
                    key={value}
                    value={value}
                    component={Link}
                    to={to}
                    iconPosition="start"
                    label={
                      <Box display="flex" gap={1} alignItems="center">
                        <p>{name}</p>
                      </Box>
                    }
                    sx={{
                      ml: value === "setting" ? "auto" : undefined,
                    }}
                  />
                );
              })}
            </Tabs>
            <Box
              onClick={toggleDrawer(true)}
              sx={{
                display: { xs: "none", sm: "flex" },
                p: 1,
                cursor: "pointer",
                minWidth: "auto",
                minHeight: "auto",
                color: "text.primary",
                textTransform: "none",
                fontSize: "1rem",
                borderRadius: "5px",
                marginRight: "10px",
                ":hover": {
                  transition: "background-color 0.5s ease",
                  bgcolor: "primary.light",
                },
              }}
            >
              <TuneIcon />
            </Box>
            <Toolbar sx={{ display: { xs: "", sm: "none" } }}>
              <Box flexGrow={1} />
              <IconButton
                color="secondary"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
            <Drawer
              anchor="right"
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <List
                sx={{
                  maxWidth: "10px",
                }}
              >
                {content.map(({ to, value, name }) => {
                  return (
                    <ListItemButton
                      key={value}
                      to={to}
                      component={Link}
                      onClick={handleDrawerToggle}
                      selected={currentTab === value}
                    >
                      {name}
                    </ListItemButton>
                  );
                })}
              </List>
              <Settings />
            </Drawer>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Settings />
      </Drawer>
    </Box>
  );
}
