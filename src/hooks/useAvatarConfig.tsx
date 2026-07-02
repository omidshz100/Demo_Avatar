import { createContext, useContext, useEffect, useState } from "react";

export interface AvatarConfig {
  glbUrl: string;
  position: [number, number, number];
  scale: number;
  background: string;
  idleAnimation: string;
}

export const AVATAR_CONFIG_DEFAULTS: AvatarConfig = {
  glbUrl: "/models/64f1a714fe61576b46f27ca2.glb",
  position: [0, 0, 0],
  scale: 1,
  background: "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)",
  idleAnimation: "Idle",
};

interface AvatarConfigContextType {
  config: AvatarConfig;
  setConfig: (patch: Partial<AvatarConfig>) => void;
}

const AvatarConfigContext = createContext<AvatarConfigContextType | null>(null);

export const AvatarConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfigState] = useState<AvatarConfig>(AVATAR_CONFIG_DEFAULTS);

  const setConfig = (patch: Partial<AvatarConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    document.body.style.background = config.background;
  }, [config.background]);

  return (
    <AvatarConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </AvatarConfigContext.Provider>
  );
};

export const useAvatarConfig = (): AvatarConfigContextType => {
  const ctx = useContext(AvatarConfigContext);
  if (!ctx) throw new Error("useAvatarConfig must be used within AvatarConfigProvider");
  return ctx;
};
