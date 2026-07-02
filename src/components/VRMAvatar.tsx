import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { GLTFLoader } from 'three-stdlib';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { useAvatarConfig } from '../hooks/useAvatarConfig';
import { useChat } from '../hooks/useChat';
import * as THREE from 'three';

export function VRMAvatar(props: JSX.IntrinsicElements['group']) {
  const { config } = useAvatarConfig();
  const { message, onMessagePlayed, loading } = useChat();
  const group = useRef<THREE.Group>(null!);
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Load VRM
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';

    loader.register((parser) => {
      return new VRMLoaderPlugin(parser as any) as any;
    });

    loader.load(
      config.glbUrl,
      (gltf) => {
        const vrmData = gltf.userData.vrm as VRM;
        if (vrmData) {
          // Disable frustum culling
          vrmData.scene.traverse((obj) => {
            obj.frustumCulled = false;
          });
          setVrm(vrmData);
        }
      },
      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      (error) => console.error('Failed to load VRM', error)
    );
  }, [config.glbUrl]);

  // Handle message lip sync
  useEffect(() => {
    if (!message || !vrm) return;

    const audioEl = new Audio("data:audio/mp3;base64," + message.audio);
    const playPromise = audioEl.play();
    setAudio(audioEl);

    audioEl.onended = () => {
      // reset lipsync
      vrm.expressionManager?.setValue('aa', 0);
      vrm.expressionManager?.setValue('ih', 0);
      vrm.expressionManager?.setValue('ou', 0);
      vrm.expressionManager?.setValue('ee', 0);
      vrm.expressionManager?.setValue('oh', 0);
      setTimeout(() => onMessagePlayed(), 600);
    };

    audioEl.onerror = onMessagePlayed;
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => onMessagePlayed());
    }
  }, [message, vrm]);

  // Update VRM and LipSync
  useFrame((_state, delta) => {
    if (vrm) {
      vrm.update(delta);

      if (message && message.lipsync && audio) {
        const currentAudioTime = audio.currentTime;
        
        // Basic viseme mapping for VRM (aa, ih, ou, ee, oh)
        // Rhubarb mouthCues mapping
        const corresponding: Record<string, string> = {
          A: "aa",
          B: "ih",
          C: "ee",
          D: "aa",
          E: "oh",
          F: "ou",
          G: "oh",
          H: "ou",
          X: "ih",
        };

        let appliedViseme = "";
        for (const mouthCue of message.lipsync.mouthCues) {
          if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
            appliedViseme = corresponding[mouthCue.value];
            break;
          }
        }

        // Reset all, then apply current
        ['aa', 'ih', 'ou', 'ee', 'oh'].forEach(v => vrm.expressionManager?.setValue(v, 0));
        if (appliedViseme) {
          vrm.expressionManager?.setValue(appliedViseme, 1);
        }
      }
    }
  });

  return (
    <group {...props} ref={group} position={config.position} scale={config.scale} rotation={[0, Math.PI, 0]}>
      {vrm && <primitive object={vrm.scene} />}

    </group>
  );
}
