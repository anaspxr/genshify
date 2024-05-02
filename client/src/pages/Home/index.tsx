import ArchonSlider from "./ArchonSlider/ArchonSwiper";
import Regions from "./Regions/Regions";
import { useThemeContext } from "../../contexts/ThemeContext";
import GuideComponent from "./GuideComponent";

import { Box, Typography } from "@mui/material";
export default function Home() {
  const { swiperIndex } = useThemeContext();
  const region = [
    "Sumeru",
    "Inazuma",
    "Mondstat",
    "Natlan",
    "Fontain",
    "Snehzhnaya",
    "Liyue",
  ];
  return (
    <Box sx={{
      paddingX:{lg:"100px",md:"50px",sm:"20px"}
    }}>
      <Typography variant="h5">
        Explore Genshin Impact regions: {region[swiperIndex]}
      </Typography>
      <Box display={"flex"}>
        <Regions />
        <ArchonSlider />
      </Box>
      <GuideComponent/>
    </Box>
  );
}
