import {
  Button,
  Checkbox,
  Divider,
  Fieldset,
  Group,
  InputDescription,
  InputLabel,
  LoadingOverlay,
  NumberInput,
  ScrollArea,
  Select,
  Slider,
  Tabs,
  Textarea,
  TextInput,
} from "@mantine/core";
import { isNotEmpty, matches, useForm } from "@mantine/form";
import type React from "react";
import { useEffect, useState } from "react";

export const Config: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mcp: {
        host: "",
        port: 8080,
      },
      tts: {
        provider: "webSpeechAPI",
        webSpeechAPI: {
          lang: "ja-JP",
          volume: 100,
          pitch: 1.0,
          rate: 1.0,
        },
        voicevox: {
          baseURL: "http://localhost:50021",
          speakerID: 1,
          volume: 100,
          pitch: 0,
          rate: 1.0,
        },
      },
      avatar: {
        mirror: false,
        animation: "sway",
        waiting: {
          path: "",
        },
        states: [] as { key: string; description: string; path: string }[],
      },
    },
    validate: {
      mcp: {
        host: matches(
          /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/,
        ),
        port: isNotEmpty(),
      },
      tts: {
        voicevox: {
          baseURL: isNotEmpty(),
          speakerID: isNotEmpty(),
        },
      },
      avatar: {},
    },
  });

  useEffect(() => {
    setLoading(true);
    window.electron.ipcRenderer.send("config:ready");
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on("config:set", (_, config, isDefaultConfig) => {
      const values = {
        mcp: {
          host: config.mcp.host,
          port: config.mcp.port,
        },
        tts: {
          provider: config.tts.provider,
          webSpeechAPI: {
            lang: config.tts.webSpeechAPI.lang,
            volume: config.tts.webSpeechAPI.volume * 100,
            pitch: (config.tts.webSpeechAPI.pitch - 1) * 100,
            rate: config.tts.webSpeechAPI.rate,
          },
          voicevox: {
            baseURL: config.tts.voicevox.baseURL,
            speakerID: config.tts.voicevox.speakerID,
            volume: config.tts.voicevox.volume * 100,
            pitch: config.tts.voicevox.pitch * 100,
            rate: config.tts.voicevox.rate,
          },
        },
        avatar: {
          mirror: config.avatar.mirror,
          animation: config.avatar.animation,
          waiting: { ...config.avatar.waiting },
          states: config.avatar.states.map((state) => ({ ...state })),
        },
      };
      form.setValues(values);
      if (!isDefaultConfig) {
        form.resetDirty(values);
      }
      setLoading(false);
    });
  }, [form]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        window.electron.ipcRenderer.send("config:update", {
          mcp: { ...values.mcp },
          tts: {
            provider: values.tts.provider,
            webSpeechAPI: {
              lang: values.tts.webSpeechAPI.lang,
              volume: values.tts.webSpeechAPI.volume / 100,
              pitch: (values.tts.webSpeechAPI.pitch + 100) / 100,
              rate: values.tts.webSpeechAPI.rate,
            },
            voicevox: {
              baseURL: values.tts.voicevox.baseURL,
              speakerID: values.tts.voicevox.speakerID,
              volume: values.tts.voicevox.volume / 100,
              pitch: values.tts.voicevox.pitch / 100,
              rate: values.tts.voicevox.rate,
            },
          },
          avatar: {
            mirror: values.avatar.mirror,
            animation: values.avatar.animation,
            waiting: { ...values.avatar.waiting },
            states: values.avatar.states
              .filter((state) => state.key.trim() !== "" && state.path.trim() !== "")
              .map((state) => ({ ...state })),
          },
        });
        form.resetDirty(values);
      })}
    >
      <LoadingOverlay visible={loading} />

      <Tabs orientation="vertical" defaultValue="mcp" h="calc(100vh)">
        <Tabs.List>
          <Tabs.Tab value="mcp">MCP</Tabs.Tab>
          <Tabs.Tab value="tts">TTS</Tabs.Tab>
          <Tabs.Tab value="avatar">Avatar</Tabs.Tab>
        </Tabs.List>

        <ConfigTabsPanel value="mcp" isChanged={!form.isDirty()}>
          <InputLabel>Bind Address</InputLabel>
          <TextInput key={form.key("mcp.host")} {...form.getInputProps("mcp.host")} />

          <InputLabel mt="sm">Port</InputLabel>
          <NumberInput
            min={0}
            max={65535}
            hideControls
            key={form.key("mcp.port")}
            {...form.getInputProps("mcp.port")}
          />
        </ConfigTabsPanel>

        <ConfigTabsPanel value="tts" isChanged={!form.isDirty()}>
          <InputLabel>TTS Provider</InputLabel>
          <InputDescription>Select a text-to-speech provider.</InputDescription>
          <Select
            data={[
              { label: "Web Speech API", value: "webSpeechAPI" },
              { label: "VOICEVOX", value: "voicevox" },
            ]}
            clearable={false}
            value={form.values.tts.provider}
            onChange={(provider) => {
              if (!provider) {
                return;
              }
              form.setFieldValue("tts.provider", provider);
            }}
          />

          {form.values.tts.provider === "webSpeechAPI" && (
            <Fieldset legend="Web Speech API Settings" my="sm">
              <InputLabel>Language</InputLabel>
              <Select
                data={[
                  { value: "de-DE", label: "Deutsch" },
                  { value: "en-US", label: "US English" },
                  { value: "en-GB", label: "UK English" },
                  { value: "es-ES", label: "español" },
                  { value: "es-US", label: "español de Estados Unidos" },
                  { value: "fr-FR", label: "français" },
                  { value: "hi-IN", label: "हिन्दी Hindi" },
                  { value: "id-ID", label: "Bahasa Indonesia" },
                  { value: "it-IT", label: "italiano" },
                  { value: "ja-JP", label: "日本語" },
                  { value: "ko-KR", label: "한국의" },
                  { value: "nl-NL", label: "Nederlands" },
                  { value: "pl-PL", label: "polski" },
                  { value: "pt-BR", label: "português do Brasil" },
                  { value: "ru-RU", label: "русский" },
                  { value: "zh-CN", label: "普通话（中国大陆）" },
                  { value: "zh-HK", label: "粤語（香港）" },
                  { value: "zh-TW", label: "國語（臺灣）" },
                ]}
                allowDeselect={false}
                value={form.values.tts.webSpeechAPI.lang}
                onChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  form.setFieldValue("tts.webSpeechAPI.lang", value);
                }}
              />

              <InputLabel mt="sm">Volume</InputLabel>
              <Slider
                mb="md"
                min={0}
                max={100}
                marks={[
                  { value: 0, label: "0%" }, // 0
                  { value: 50, label: "50%" }, // 0.5
                  { value: 100, label: "100%" }, // 1
                ]}
                value={form.values.tts.webSpeechAPI.volume}
                onChange={(value) => form.setFieldValue("tts.webSpeechAPI.volume", value)}
              />

              <InputLabel mt="sm">Pitch</InputLabel>
              <Slider
                mb="md"
                min={-100}
                max={100}
                marks={[
                  { value: -100, label: "-100%" }, // 0
                  { value: 0, label: "0%" }, // 1
                  { value: 100, label: "+100%" }, // 2
                ]}
                value={form.values.tts.webSpeechAPI.pitch}
                onChange={(value) => form.setFieldValue("tts.webSpeechAPI.pitch", value)}
              />

              <InputLabel mt="sm">Rate</InputLabel>
              <Select
                data={[
                  { value: "0.25", label: "0.25x" },
                  { value: "0.50", label: "0.50x" },
                  { value: "0.75", label: "0.75x" },
                  { value: "1.00", label: "1.00x" },
                  { value: "1.25", label: "1.25x" },
                  { value: "1.50", label: "1.50x" },
                  { value: "1.75", label: "1.75x" },
                  { value: "2.00", label: "2.00x" },
                ]}
                allowDeselect={false}
                value={form.values.tts.webSpeechAPI.rate.toFixed(2)}
                onChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  form.setFieldValue("tts.webSpeechAPI.rate", parseFloat(value));
                }}
              />
            </Fieldset>
          )}

          {form.values.tts.provider === "voicevox" && (
            <Fieldset legend="VOICEVOX Settings" my="sm">
              <InputLabel>Base URL</InputLabel>
              <InputDescription>
                Enter the base URL for the VOICEVOX engine.
                <br />
                See: https://github.com/VOICEVOX/voicevox_engine
              </InputDescription>
              <TextInput
                placeholder="http://localhost:50021"
                key={form.key("tts.voicevox.baseURL")}
                {...form.getInputProps("tts.voicevox.baseURL")}
              />

              <InputLabel mt="sm">Speaker ID</InputLabel>
              <InputDescription>
                Specify the speaker ID for the VOICEVOX engine.
                <br />
                See:{" "}
                {form.values.tts.voicevox.baseURL.trim()
                  ? `${form.values.tts.voicevox.baseURL.trim()}/speakers`
                  : "http://localhost:50021/speakers"}
              </InputDescription>
              <NumberInput
                min={0}
                hideControls
                placeholder="1"
                key={form.key("tts.voicevox.speakerID")}
                {...form.getInputProps("tts.voicevox.speakerID")}
              />

              <InputLabel mt="sm">Volume</InputLabel>
              <Slider
                mb="md"
                min={0}
                max={100}
                marks={[
                  { value: 0, label: "0%" }, // 0
                  { value: 50, label: "50%" }, // 0.5
                  { value: 100, label: "100%" }, // 1
                ]}
                value={form.values.tts.voicevox.volume}
                onChange={(value) => form.setFieldValue("tts.voicevox.volume", value)}
              />

              <InputLabel mt="sm">Pitch</InputLabel>
              <Slider
                mb="md"
                min={-100}
                max={100}
                marks={[
                  { value: -100, label: "-100%" }, // -1
                  { value: 0, label: "0%" }, // 0
                  { value: 100, label: "+100%" }, // 1
                ]}
                value={form.values.tts.voicevox.pitch}
                onChange={(value) => form.setFieldValue("tts.voicevox.pitch", value)}
              />

              <InputLabel mt="sm">Rate</InputLabel>
              <Select
                data={[
                  { value: "0.25", label: "0.25x" },
                  { value: "0.50", label: "0.50x" },
                  { value: "0.75", label: "0.75x" },
                  { value: "1.00", label: "1.00x" },
                  { value: "1.25", label: "1.25x" },
                  { value: "1.50", label: "1.50x" },
                  { value: "1.75", label: "1.75x" },
                  { value: "2.00", label: "2.00x" },
                ]}
                allowDeselect={false}
                value={form.values.tts.voicevox.rate.toFixed(2)}
                onChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  form.setFieldValue("tts.voicevox.rate", parseFloat(value));
                }}
              />
            </Fieldset>
          )}
        </ConfigTabsPanel>

        <ConfigTabsPanel value="avatar" isChanged={!form.isDirty()}>
          <Checkbox
            mt="sm"
            variant="outline"
            label="Mirror"
            description="The avatar image will be displayed horizontally flipped"
            key={form.key("avatar.mirror")}
            checked={form.values.avatar.mirror}
            onChange={(event) => form.setFieldValue("avatar.mirror", event.currentTarget.checked)}
          />

          <InputLabel mt="sm">Animation</InputLabel>
          <Select
            data={[
              { label: "None", value: "none" },
              { label: "Sway", value: "sway" },
              { label: "Weight shift", value: "weight-shift" },
              { label: "Breathing", value: "breathing" },
              { label: "Float", value: "float" },
            ]}
            clearable={false}
            value={form.values.avatar.animation}
            onChange={(animation) => {
              if (!animation) {
                return;
              }
              form.setFieldValue("avatar.animation", animation);
            }}
          />

          <Fieldset mt="sm" legend="Emotional states">
            <InputLabel>Key</InputLabel>
            <InputDescription>A unique key to identify an emotional state.</InputDescription>
            <TextInput value="waiting" readOnly disabled />

            <InputLabel mt="sm">Description</InputLabel>
            <InputDescription>Hints for AI to select emotional state.</InputDescription>
            <Textarea value="waiting, doing nothing, having nothing to do" readOnly disabled />

            <InputLabel mt="sm">Image file</InputLabel>
            <InputDescription>
              Avatar image to apply when you are in this emotional state.
              <br />
              Valid formats: PNG, GIF, JPEG, WebP, SVG
              <br />
              Please specify the absolute path.
            </InputDescription>
            <TextInput key={form.key("avatar.waiting.path")} {...form.getInputProps("avatar.waiting.path")} />

            <Group justify="flex-end" my="sm">
              <Button type="button" variant="outline" color="red" size="xs" disabled>
                Remove
              </Button>
            </Group>

            <Divider my="sm" />

            {form.values.avatar.states.map((_, i) => (
              <>
                <InputLabel>Key</InputLabel>
                <InputDescription>A unique key to identify an emotional state.</InputDescription>
                <TextInput key={form.key(`avatar.states.${i}.key`)} {...form.getInputProps(`avatar.states.${i}.key`)} />

                <InputLabel mt="sm">Description</InputLabel>
                <InputDescription>Hints for AI to select emotional state.</InputDescription>
                <Textarea
                  key={form.key(`avatar.states.${i}.description`)}
                  {...form.getInputProps(`avatar.states.${i}.description`)}
                />

                <InputLabel mt="sm">Image file</InputLabel>
                <InputDescription>
                  Avatar image to apply when you are in this emotional state.
                  <br />
                  Valid formats: PNG, GIF, JPEG, WebP, SVG
                  <br />
                  Please specify the absolute path.
                </InputDescription>
                <TextInput
                  key={form.key(`avatar.states.${i}.path`)}
                  {...form.getInputProps(`avatar.states.${i}.path`)}
                />

                <Group justify="flex-end" my="sm">
                  <Button
                    type="button"
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => {
                      form.removeListItem("avatar.states", i);
                    }}
                  >
                    Remove
                  </Button>
                </Group>

                <Divider my="sm" />
              </>
            ))}

            <Group justify="flex-start" my="sm">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  form.insertListItem("avatar.states", { key: "", description: "", path: "" });
                }}
              >
                Add
              </Button>
            </Group>
          </Fieldset>
        </ConfigTabsPanel>
      </Tabs>
    </form>
  );
};

const ConfigTabsPanel: React.FC<React.PropsWithChildren<{ value: string; isChanged: boolean }>> = ({
  value,
  isChanged,
  children,
}) => (
  <Tabs.Panel value={value}>
    <ScrollArea h="calc(100vh - 50px)" py="5px" px="10px" type="auto" offsetScrollbars="y">
      {children}
    </ScrollArea>
    <Group h="50px" justify="flex-end" py="5px" px="10px">
      <Button type="submit" disabled={isChanged}>
        Save
      </Button>
    </Group>
  </Tabs.Panel>
);
