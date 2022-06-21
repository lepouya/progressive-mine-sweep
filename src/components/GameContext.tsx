import { createContext, FC, PropsWithChildren, useContext } from "react";

import { emptyContext, wrapContext } from "../model/Context";

const _context = emptyContext<boolean>();
const GameReactContext = createContext(_context);

export const GameContextProvider: FC<PropsWithChildren<{}>> = (props) => (
  <GameReactContext.Provider value={_context}>
    {props.children}
  </GameReactContext.Provider>
);

export default function useGameContext() {
  return wrapContext(useContext(GameReactContext));
}
