declare module "use-sound" {
  type PlayFunction = () => void;
  type HookOptions = {
    volume?: number;
    playbackRate?: number;
    interrupt?: boolean;
    soundEnabled?: boolean;
    sprite?: { [key: string]: [number, number] };
    onend?: () => void;
  };

  export default function useSound(
    src: string,
    options?: HookOptions
  ): [PlayFunction, { stop: () => void; pause: () => void }];
}
