//import components
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Beginner from "./pages/Beginner/Beginner";
import Showcase from "./pages/Showcase";
import CharacterDisplay from "./pages/Showcase/SingleCharacterPage";
import { alpha } from "@mui/material";

import { Container, Grid, Skeleton, CssBaseline } from "@mui/material";
import { DatabaseContext } from "genshin-optimizer/db-ui";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary";
import "./App.scss";
import "./App.css";
import Snow from "./components/Effects/Primo";

import { Suspense, useCallback, useMemo, useState } from "react";
import { ArtCharDatabase } from "genshin-optimizer/db";
import { DBLocalStorage, SandboxStorage } from "genshin-optimizer/database";
import Footer from "./components/Navbar/Footer";
import Header from "./components/Navbar/Header";
import { SnowContext, useSnow } from "./contexts/PrimoContext";
import { ThemeProviderComponent } from "./contexts/ThemeContext";
import ScrollToHashElement from "./utils/ScrollToHashElements";

export default function App() {
  // ? retrieves the dbIndex from local storage, parsing it into an integer. index indicates which database to use.
  const dbIndex = parseInt(localStorage.getItem("dbIndex") || "1");
  const [databases, setDatabases] = useState(() => {
    return ([1, 2] as const).map((index) => {
      if (index === dbIndex) {
        return new ArtCharDatabase(index, new DBLocalStorage(localStorage));
      } else {
        const dbName = `extraDatabase_${index}`;
        const eDB = localStorage.getItem(dbName);
        const dbObj = eDB ? JSON.parse(eDB) : {};
        const db = new ArtCharDatabase(index, new SandboxStorage(dbObj));
        db.toExtraLocalDB();
        return db;
      }
    });
  });
  const setDatabase = useCallback(
    (index: number, db: ArtCharDatabase) => {
      const dbs = [...databases];
      dbs[index] = db;
      setDatabases(dbs);
    },
    [databases, setDatabases]
  );

  const database = databases[dbIndex - 1];
  const dbContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  );
  const SnowContextObj = useSnow();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <ThemeProviderComponent>
              <CssBaseline />
              <ScrollToHashElement />
              <SnowContext.Provider value={SnowContextObj}>
                <DatabaseContext.Provider value={dbContextObj}>
                  <ErrorBoundary>
                    <Grid
                      container
                      direction="column"
                      minHeight="100vh"
                      position="relative"
                      sx={(theme) => ({
                        width: "100%",
                        backgroundImage:
                          theme.palette.mode !== "dark"
                            ? `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                            : `linear-gradient(#02294F, ${alpha(
                                "#090E10",
                                0.0
                              )})`,
                        backgroundSize: "100% 500px",
                        backgroundRepeat: "no-repeat",
                      })}
                    >
                      <Grid
                        style={{
                          marginBottom: "100px",
                        }}
                        item
                      >
                        <Header anchor="back-to-top-anchor" />
                      </Grid>
                      <Container
                        maxWidth="xl"
                        sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}
                      >
                        <Suspense
                          fallback={
                            <Skeleton
                              variant="rectangular"
                              sx={{ width: "100%", height: "100%" }}
                            />
                          }
                        >
                          <Routes>
                            <Route index element={<Home />} />
                            <Route path="/#explore" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/beginner" element={<Beginner />} />
                            <Route path="showcase/*">
                              <Route index element={<Showcase />} />
                              <Route
                                path=":characterKey/*"
                                element={<CharacterDisplay />}
                              />
                            </Route>
                          </Routes>
                        </Suspense>
                      </Container>
                      <Grid item flexGrow={1} />
                      <Snow />
                      <Grid item>
                        <Footer />
                      </Grid>
                    </Grid>
                  </ErrorBoundary>
                </DatabaseContext.Provider>
              </SnowContext.Provider>
            </ThemeProviderComponent>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
