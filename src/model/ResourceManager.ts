import Optional from "../utils/Optional";
import { Resource, ResourceCount } from "./Resource";

export type ResourceManager = {
  resources: Record<string, Resource>;
  lastUpdate?: number;

  create: (props: Optional<Resource>) => Resource;
  update: (now?: number) => void;
  purchase: (toBuy: ResourceCount[]) => ResourceCount[];
};
