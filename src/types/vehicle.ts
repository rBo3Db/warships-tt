export interface VehicleTypeIcons {
  default: string;
  elite: string;
  premium: string;
  special: string;
  normal: string;
}

export interface VehicleTypeInfo {
  icons: VehicleTypeIcons;
  sort_order: number;
  localization: {
    shortmark?: Record<string, string>;
    mark: Record<string, string>;
  };
}

export type VehicleTypesMap = Record<string, VehicleTypeInfo>;

export interface VehicleTypesApiResponse {
  status: string;
  data: VehicleTypesMap;
}

export interface VehicleIcons {
  default?: string;
  small?: string;
  medium?: string;
  large?: string;
  contour?: string;
  contour_alive?: string;
  contour_dead?: string;
  local_small?: string;
  local_contour?: string;
  local_contour_alive?: string;
  local_contour_dead?: string;
  [key: string]: string | undefined;
}

export interface VehicleLocalization {
  shortmark?: Record<string, string>;
  mark?: Record<string, string>;
  description?: Record<string, string>;
}

export interface VehicleRaw {
  level: number;
  name: string;
  icons: VehicleIcons;
  tags: string[];
  localization: VehicleLocalization;
  nation: string;
}

export interface Vehicle extends VehicleRaw {
  id: string;
  type: string;
}

export interface VehiclesApiResponse {
  status: string;
  data: Record<string, VehicleRaw>;
}

export const ShipStatus = {
  ALL: 'all',
  RESEARCHABLE: 'researchable',
  PREMIUM: 'premium',
} as const;

export type ShipStatus = (typeof ShipStatus)[keyof typeof ShipStatus];

export const ShipSortOption = {
  TIER_ASC: 'tier_asc',
  TIER_DESC: 'tier_desc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  TYPE: 'type',
} as const;

export type ShipSortOption = (typeof ShipSortOption)[keyof typeof ShipSortOption];

export const ViewMode = {
  GRID: 'grid',
  TREE: 'tree',
} as const;

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];


