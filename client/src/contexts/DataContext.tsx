import type { CharacterKey } from "genshin-optimizer/consts";
import type { ICachedCharacter, ICachedWeapon } from "genshin-optimizer/db";
import { createContext } from "react";
import type CharacterSheet from "../libs/GO-files/Data/Characters/CharacterSheet";
import type WeaponSheet from "../libs/GO-files/Data/Weapons/WeaponSheet";
import type { UIData } from "../libs/GO-files/Formula/uiData";
export type TeamData = Partial<
  Record<
    CharacterKey,
    {
      target: UIData;
      buffs: Dict<CharacterKey, UIData>;
      character: ICachedCharacter;
      weapon: ICachedWeapon;
      characterSheet: CharacterSheet;
      weaponSheet: WeaponSheet;
    }
  >
>;
export type dataContextObj = {
  data: UIData;
  oldData?: UIData;
  teamData: TeamData;
};

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj);
