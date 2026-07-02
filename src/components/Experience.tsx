import { CameraControls, ContactShadows, Environment, Text, Billboard } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useAvatarConfig } from "../hooks/useAvatarConfig";
import { Avatar } from "./Avatar";
import { VRMAvatar } from "./VRMAvatar";

const Dots = (props: { "position-y"?: number; "position-x"?: number }) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prev) => (prev.length > 2 ? "." : prev + "."));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <Billboard {...props}>
      <Text fontSize={0.14} anchorX="left" anchorY="bottom">
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </Billboard>
  );
};


export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null!);
  const { cameraZoomed } = useChat();
  const { config } = useAvatarConfig();

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  const isVrm = config.glbUrl.toLowerCase().endsWith('.vrm');

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      {isVrm ? (
        <VRMAvatar key={config.glbUrl} />
      ) : (
        <Avatar key={config.glbUrl} />
      )}
      <ContactShadows opacity={0.7} />
    </>
  );
};
