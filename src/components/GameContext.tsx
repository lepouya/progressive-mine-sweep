import { createContext, FC, PropsWithChildren, useContext } from "react";
import { Context, emptyContext, wrapContext } from "../model/Context";

const GameReactContext = createContext<Context>(emptyContext());

export const GameContextProvider: FC<PropsWithChildren<{}>> = (props) => (
  <GameReactContext.Provider value={emptyContext()}>
    {props.children}
  </GameReactContext.Provider>
);

export function useGameContext() {
  return wrapContext(useContext(GameReactContext));
}

export function useResources() {
  return useContext(GameReactContext).resourceManager.resources;
}

export default useGameContext;
