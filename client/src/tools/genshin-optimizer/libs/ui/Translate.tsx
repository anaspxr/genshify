/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton, Typography } from "@mui/material";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { Palette, PaletteColor } from "@mui/material";
import type { HTMLAttributes } from "react";
import { styled } from "@mui/material";

interface ColorTextProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof Palette;
}

const SqBadge = styled("span", {
  name: "SqBadge",
  slot: "Root",
})<ColorTextProps>(({ theme, color = "primary" }) => ({
  display: "inline-block",
  padding: ".25em .4em",
  lineHeight: 1,
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "baseline",
  borderRadius: ".25em",
  backgroundColor: (theme.palette[color] as PaletteColor | undefined)?.main,
  color: (theme.palette[color] as PaletteColor | undefined)?.contrastText,
}));

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

const textComponents = {
  anemo: <ColorText color="anemo" />,
  geo: <ColorText color="geo" />,
  cryo: <ColorText color="cryo" />,
  hydro: <ColorText color="hydro" />,
  pyro: <ColorText color="pyro" />,
  electro: <ColorText color="electro" />,
  dendro: <ColorText color="dendro" />,
  heal: <ColorText color="heal" />,
  vaporize: <ColorText color="vaporize" />,
  spread: <ColorText color="spread" />,
  aggravate: <ColorText color="aggravate" />,
  overloaded: <ColorText color="overloaded" />,
  superconduct: <ColorText color="superconduct" />,
  electrocharged: <ColorText color="electrocharged" />,
  shattered: <ColorText color="shattered" />,
  bloom: <ColorText color="bloom" />,
  burgeon: <ColorText color="burgeon" />,
  hyperbloom: <ColorText color="hyperbloom" />,
};
const badgeComponents = {
  anemo: <SqBadge color="anemo" />,
  geo: <SqBadge color="geo" />,
  cryo: <SqBadge color="cryo" />,
  hydro: <SqBadge color="hydro" />,
  pyro: <SqBadge color="pyro" />,
  electro: <SqBadge color="electro" />,
  dendro: <SqBadge color="dendro" />,
  heal: <SqBadge color="heal" />,
  vaporize: <SqBadge color="vaporize" />,
  spread: <SqBadge color="spread" />,
  aggravate: <SqBadge color="aggravate" />,
  overloaded: <SqBadge color="overloaded" />,
  superconduct: <SqBadge color="superconduct" />,
  electrocharged: <SqBadge color="electrocharged" />,
  shattered: <SqBadge color="shattered" />,
  bloom: <SqBadge color="bloom" />,
  burgeon: <SqBadge color="burgeon" />,
  hyperbloom: <SqBadge color="hyperbloom" />,
};

/**
 * Note: Trans.values & Trans.components wont work together...
 */
export function Translate({
  ns,
  key18,
  values,
  children,
  useBadge,
}: {
  ns: string;
  key18: string;
  values?: Record<string, string>;
  children?: ReactNode;
  useBadge?: boolean;
}) {
  const { t } = useTranslation(ns);
  const textKey = `${ns}:${key18}`;
  const textObj = values
    ? t(textKey, { returnObjects: true, ...values })
    : t(textKey, { returnObjects: true });
  if (typeof textObj === "string")
    return (
      <Trans
        i18nKey={textKey}
        t={t}
        components={useBadge ? badgeComponents : textComponents}
        values={values}
      >
        {children}
      </Trans>
    );

  return (
    <Suspense fallback={<Skeleton>{children}</Skeleton>}>
      <T
        key18={textKey}
        obj={textObj}
        t={t}
        values={values}
        useBadge={useBadge}
      />
    </Suspense>
  );
}
/**this is used cause the `components` prop mess with tag interpolation. */
export function TransWrapper({
  ns,
  key18,
  values,
  children,
}: {
  ns: string;
  key18: string;
  values?: any;
  children?: any;
}) {
  const { t } = useTranslation(ns);
  const textKey = `${ns}:${key18}`;
  return (
    <Suspense fallback={<Skeleton>{children}</Skeleton>}>
      <Trans i18nKey={textKey} t={t} values={values}>
        {children}
      </Trans>
    </Suspense>
  );
}
function Para({ children }: { children?: JSX.Element }) {
  return <Typography gutterBottom>{children}</Typography>;
}

function T({
  key18,
  obj,
  li,
  t,
  values,
  useBadge,
}: {
  key18: string;
  obj: any;
  li?: boolean;
  t: TFunction<string, undefined>;
  values?: any;
  useBadge?: boolean;
}) {
  if (typeof obj === "string")
    return (
      <Trans
        i18nKey={key18}
        components={useBadge ? badgeComponents : textComponents}
        parent={Para}
        t={t}
        values={values}
      />
    );
  if (Array.isArray(obj))
    return (
      <Typography component="div">
        <ul>
          <T
            key18={key18}
            obj={{ ...obj }}
            li
            t={t}
            values={values}
            useBadge={useBadge}
          />
        </ul>
      </Typography>
    );
  return Object.entries(obj).map(([key, val]) => {
    if (val === "<br/>") return null;

    if (typeof val === "object")
      return (
        <T
          key={key as any}
          key18={`${key18}.${key as any}`}
          obj={val}
          t={t}
          values={values}
          useBadge={useBadge}
        />
      );
    if (typeof val === "string") {
      const trans = (
        <Trans
          key={key as any}
          i18nKey={`${key18}.${key}`}
          components={useBadge ? badgeComponents : textComponents}
          parent={Para}
          t={t}
          values={values}
        />
      );
      return li ? <li key={key as any}>{trans}</li> : trans;
    }
    return null;
  }) as any;
}
