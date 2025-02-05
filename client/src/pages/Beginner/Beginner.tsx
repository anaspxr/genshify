import type { Palette, PaletteColor } from "@mui/material";
import type { HTMLAttributes } from "react";
import { styled } from "@mui/material";
import { useTranslation } from "react-i18next";

// import a from "./aa.json"
// for (const [key, value] of Object.entries(a)) {
//   const rep=`/src/tools/genshin-optimizer/libs/assets/gen/chars/${key}/`
//   for (const [k, v] of Object.entries(value)) {
//     a[key][k] = v.replace(rep,"")
//   }
// }
// console.log(a);



interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof Palette;
  variant?: keyof PaletteColor;
}

const ColorText = styled("span")<ColorTextProps>(
  ({ theme, color, variant = "main" }) => {
    if (!color) return {};
    const pc = theme.palette[color] as PaletteColor;
    if (!pc) return {};
    const pcv = pc[variant];
    if (!pcv) return {};
    return { color: pcv };
  }
);

export default function Beginner() {
  const { t } = useTranslation("artifact_Adventurer_gen");
  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <h1>Beginner</h1>
      <p>
        <ColorText color="hydro">Lorem ipsum dolor sit amet</ColorText>,
        consectetur adipisicing elit. Quos, voluptate.
      </p>
      <p>{t("setName", { ns: "artifact_Adventurer_gen" })}</p>
    </div>
  );
}
