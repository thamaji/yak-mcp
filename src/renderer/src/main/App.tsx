import "@mantine/core/styles.css";
import { useEffect, useSyncExternalStore } from "react";
import { avatarStore } from "./avatarStore";

export const App: React.FC = () => {
  const avatar = useSyncExternalStore(avatarStore.subscribe, avatarStore.getSnapshot);

  useEffect(() => {
    window.electron.ipcRenderer.send("main:ready");
  }, []);

  return (
    <div className="avatar_container" style={avatar?.mirror ? { transform: "scaleX(-1)" } : {}}>
      {/** biome-ignore lint/a11y/useAltText: デスクトップマスコットなので気にしない */}
      {avatar && <img className="avatar_image wiggle" src={avatar.path} />}
    </div>
  );
};
