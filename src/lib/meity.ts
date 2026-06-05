import rawData from "../../data/meity-network.json";

export interface MeityOrg {
  id: string;
  name: string;
  logoUrl: string | null;
  city: string;
  state: string;
  domains: string[];
}

export const meityAccelerators: MeityOrg[] = rawData.accelerators as MeityOrg[];
export const meityIncubators: MeityOrg[] = rawData.incubators as MeityOrg[];

export const MEITY_ACCELERATOR_URL = "https://msh.meity.gov.in/network/accelerator";
export const MEITY_INCUBATOR_URL = "https://msh.meity.gov.in/network/incubator";
