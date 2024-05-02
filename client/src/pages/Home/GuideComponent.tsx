import coverImage from "../../assets/images/yae+raid-l-min.webp";
import { Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
export default function GuideComponent() {
  return (
    <Container
      sx={{
        background: "background",
        borderRadius: "20px",
        padding: "1.5rem",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "primary.dark",
          textAlign: "center",
        }}
      >
        Guides for beginners
      </Typography>
      <Box
        sx={{
          borderRadius: "20px",
        }}
      >
        <Link
          style={{
            textDecoration: "none",
            color: "white",
          }}
          to="/#explore"
        >
          <img
            style={{
              maxWidth: "100%",
              borderRadius: "15px 15px 0px 0px",
            }}
            src={coverImage}
            alt="Cover Image"
          />
          <Typography
            variant="h6"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: "100%",
              height: "20%",
              display: "flex",
              padding: "0.4rem",
              justifyContent: "flex-start",
              alignItems: "center",
              right: 0,
              borderRadius: "0px 0px 15px 15px",
            }}
          >
            Guides
          </Typography>
        </Link>
      </Box>
    </Container>
  );
}
