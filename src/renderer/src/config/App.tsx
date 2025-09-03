import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Config } from "./Config";

export const App: React.FC = () => {
  return (
    <MantineProvider defaultColorScheme="auto">
      <Config />
    </MantineProvider>
  );
};
