export interface NationIcons {
  large: string;
  default: string;
  local_large: string;
  local_tiny: string;
  small: string;
  local_small: string;
  tiny: string;
}

export interface NationLocalization {
  mark: Record<string, string>;
}

export interface Nation {
  id: number;
  name: string;
  color: number;
  tags: string[];
  icons: NationIcons;
  localization: NationLocalization;
}

export interface NationsApiResponse {
  status: string;
  data: Nation[];
}
