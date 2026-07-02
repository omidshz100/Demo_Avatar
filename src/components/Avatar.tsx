import { useAnimations, useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import type { AnimationMixer, Group, Object3D } from "three";
import { GLTF } from "three-stdlib";
import { useChat } from "../hooks/useChat";
import { useAvatarConfig } from "../hooks/useAvatarConfig";

interface ExtendedAnimationMixer extends AnimationMixer {
  stats: { actions: { inUse: number } };
}

interface AvatarGLTF extends GLTF {
  nodes: Record<string, THREE.SkinnedMesh>;
  materials: Record<string, THREE.Material>;
}

type FacialExpressionName =
  | "default"
  | "smile"
  | "funnyFace"
  | "sad"
  | "surprised"
  | "angry"
  | "crazy";

type MorphTargetValues = Record<string, number>;

const facialExpressions: Record<FacialExpressionName, MorphTargetValues> = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding: Record<string, string> = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

export function Avatar(props: JSX.IntrinsicElements["group"]) {
  const { config } = useAvatarConfig();
  const { nodes, scene } = useGLTF(config.glbUrl) as unknown as AvatarGLTF;

  const { message, onMessagePlayed, chat, loading, setAudioProgress } = useChat();

  const [lipsync, setLipsync] = useState<{ mouthCues: { start: number; end: number; value: string }[] } | null>(null);
  const [animation, setAnimation] = useState(config.idleAnimation);
  const [facialExpression, setFacialExpression] = useState<FacialExpressionName>("default");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const talkingAnimations = ["Talking_0", "Talking_1", "Talking_2"];
  const animationCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);

  const { animations } = useGLTF("/models/animations.glb");
  const group = useRef<Group>(null!);

  const { actions } = useAnimations(animations, group) as ReturnType<typeof useAnimations> & { mixer: ExtendedAnimationMixer };

  // Dynamically find the head node (prioritize nodes with eyeBlinkLeft)
  const headNode = useMemo(() => {
    let bestNode: THREE.SkinnedMesh | null = null;
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        if (!bestNode || child.morphTargetDictionary['eyeBlinkLeft'] !== undefined) {
          bestNode = child;
        }
      }
    });
    return bestNode;
  }, [scene]);

  // Pre-calculate lowercased mappings to optimize lerpMorphTarget
  const targetKeyCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!animations.length) return;
    const hasIdle = animations.some((a) => a.name === config.idleAnimation);
    setAnimation(hasIdle ? config.idleAnimation : animations[0]?.name ?? config.idleAnimation);
  }, [animations]);

  useEffect(() => {
    if (animationCycleRef.current) {
      clearInterval(animationCycleRef.current);
      animationCycleRef.current = null;
    }

    if (!message) {
      setAnimation(config.idleAnimation);
      return;
    }

    const validAnimations = animations.map((a) => a.name);
    const requestedAnim = message.animation;
    const resolvedAnim = validAnimations.includes(requestedAnim)
      ? requestedAnim
      : talkingAnimations[Math.floor(Math.random() * talkingAnimations.length)];

    setAnimation(resolvedAnim);
    setFacialExpression((message.facialExpression as FacialExpressionName) ?? "default");
    setLipsync(message.lipsync);

    if (talkingAnimations.includes(resolvedAnim)) {
      animationCycleRef.current = setInterval(() => {
        const next = talkingAnimations[Math.floor(Math.random() * talkingAnimations.length)];
        setAnimation(next);
      }, 3000);
    }

    const audioEl = new Audio("data:audio/mp3;base64," + message.audio);
    const playPromise = audioEl.play();
    setAudio(audioEl);
    
    audioEl.ontimeupdate = () => {
      if (audioEl.duration > 0) {
        setAudioProgress(audioEl.currentTime / audioEl.duration);
      }
    };
    
    audioEl.onended = () => {
      if (animationCycleRef.current) {
        clearInterval(animationCycleRef.current);
        animationCycleRef.current = null;
      }
      setAnimation(config.idleAnimation);
      setAudioProgress(0);
      setTimeout(() => onMessagePlayed(), 600);
    };
    audioEl.onerror = () => {
      setAudioProgress(0);
      onMessagePlayed();
    };
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setAudioProgress(0);
        onMessagePlayed();
      });
    }
  }, [message]);

  useEffect(() => {
    const action = actions?.[animation];
    if (!action) return;
    action.reset().fadeIn(0.5).play();
    return () => { action.fadeOut(0.5); };
  }, [animation, actions]);

  useEffect(() => {
    if (!message) setAnimation(config.idleAnimation);
  }, [config.idleAnimation]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child: Object3D) => {
      if (!(child instanceof THREE.SkinnedMesh) || !child.morphTargetDictionary) return;
      
      let actualKey = target;
      if (child.morphTargetDictionary[actualKey] === undefined) {
        const cacheKey = `${child.uuid}_${target}`;
        if (!targetKeyCache.current[cacheKey]) {
           const lowerTarget = target.toLowerCase();
           const found = Object.keys(child.morphTargetDictionary).find(k => k.toLowerCase() === lowerTarget);
           if (found) {
               targetKeyCache.current[cacheKey] = found;
           } else {
               targetKeyCache.current[cacheKey] = target; // fallback
           }
        }
        actualKey = targetKeyCache.current[cacheKey];
      }

      const index = child.morphTargetDictionary[actualKey];
      if (index === undefined || child.morphTargetInfluences![index] === undefined) return;
      child.morphTargetInfluences![index] = THREE.MathUtils.lerp(
        child.morphTargetInfluences![index],
        value,
        speed
      );
      
      // Removed the heavy set() call here for performance. The setupMode slider will still work if setupMode is true 
      // because the slider's onChange handler calls lerpMorphTarget directly.
    });
  };

  useFrame(() => {
    if (setupMode) return;

    if (headNode?.morphTargetDictionary) {
      Object.keys(headNode.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
        
        // Don't let facial expressions overwrite lip-sync visemes!
        if (key.toLowerCase().startsWith("viseme_")) return;
        
        const mapping = facialExpressions[facialExpression];
        lerpMorphTarget(key, mapping?.[key] ?? 0, 0.1);
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    const appliedMorphTargets: string[] = [];
    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      for (const mouthCue of lipsync.mouthCues) {
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          const viseme = corresponding[mouthCue.value];
          if (viseme) {
            appliedMorphTargets.push(viseme);
            lerpMorphTarget(viseme, 1, 0.2);
          }
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (!appliedMorphTargets.includes(value)) {
        lerpMorphTarget(value, 0, 0.1);
      }
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat("")),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value: string) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions) as FacialExpressionName[],
      onChange: (value: FacialExpressionName) => setFacialExpression(value),
    },
    enableSetupMode: button(() => { setupMode = true; }),
    disableSetupMode: button(() => { setupMode = false; }),
    logMorphTargetValues: button(() => {
      if (!headNode?.morphTargetDictionary) return;
      const emotionValues: MorphTargetValues = {};
      Object.keys(headNode.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
        const idx = headNode.morphTargetDictionary![key];
        const val = headNode.morphTargetInfluences![idx];
        if (val > 0.01) emotionValues[key] = val;
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  useControls("MorphTarget", () => {
    if (!headNode?.morphTargetDictionary) return {};
    return Object.assign(
      {},
      ...Object.keys(headNode.morphTargetDictionary).map((key) => ({
        [key]: {
          label: key,
          value: 0,
          min: headNode.morphTargetInfluences![headNode.morphTargetDictionary![key]],
          max: 1,
          onChange: (val: number) => {
            if (setupMode) lerpMorphTarget(key, val, 1);
          },
        },
      }))
    );
  }, [headNode]);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group} position={config.position} scale={config.scale} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={scene} />

    </group>
  );
}

useGLTF.preload("/models/animations.glb");
