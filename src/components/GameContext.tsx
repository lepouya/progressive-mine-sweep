import { createContext, FC, PropsWithChildren, useContext } from "react";
import { Context, emptyContext, wrapContext } from "../model/Context";

const GameReactContext = createContext<Context>(emptyContext());
export const useGameContext = () => wrapContext(useContext(GameReactContext));
export const GameContextProvider: FC<PropsWithChildren<{}>> = (props) => (
  <GameReactContext.Provider value={emptyContext()}>
    {props.children}
  </GameReactContext.Provider>
);

export default useGameContext;
