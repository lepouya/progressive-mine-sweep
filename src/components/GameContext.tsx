import { createContext, FC, PropsWithChildren, useContext } from "react";

import { emptyContext, wrapContext } from "../model/Context";

const GameReactContext = createContext(emptyContext<boolean>());

export const GameContextProvider: FC<PropsWithChildren<{}>> = (props) => (
  <GameReactContext.Provider value={emptyContext()}>
    {props.children}
  </GameReactContext.Provider>
);

export default function useGameContext() {
  return wrapContext(useContext(GameReactContext));
}
