export type ProviderType = "redash" | "metabase"
export const ProviderTypes: Record<string, ProviderType>  ={
  REDASH: "redash",
  METABASE: "metabase",
}

export default interface Provider {
  type: ProviderType;
  name: string;
  current: boolean;
  credential: string;
  url: string;
}
