import type { AscensionKey, CharacterKey } from "../consts";

export interface ICharacterTalent {
  auto: number;
  skill: number;
  burst: number;
}

export interface ICharacter {
  key: CharacterKey;
  level: number;
  constellation: number;
  ascension: AscensionKey;
  talent: ICharacterTalent;
}
