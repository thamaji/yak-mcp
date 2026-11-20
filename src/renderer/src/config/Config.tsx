import {
  Button,
  Code,
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
  Stack,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { isNotEmpty, matches, useForm } from "@mantine/form";
import React, { useEffect, useState } from "react";

export const Config: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState("");

  const form = useForm({
    mode: "uncontrolled",
    validateInputOnChange: true,
    validateInputOnBlur: true,
    initialValues: {
      mcp: {
        host: "",
        port: 8080,
        restAPI: false,
      },
      tts: {
        provider: "webSpeechAPI",
        maxQueueWaitTime: 15,
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
        irodoritts: {
          baseURL: "http://localhost:8088",
          voice: null as string | null,
          caption: "",
          volume: 1.0,
          rate: 1.0,
        },
      },
      avatar: {
        mirror: false,
        animation: "sway",
        opacity: 100,
        ignoreMouseEvents: false,
        waiting: {
          path: "",
        },
        states: [] as { key: string; description: string; path: string; id: string }[],
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
          baseURL: (value: string) => {
            try {
              const url = new URL(value);
              if (url.protocol !== "http:" && url.protocol !== "https:") {
                return "Invalid URL";
              }
              return null;
            } catch {
              return "Invalid URL";
            }
          },
          speakerID: isNotEmpty(),
        },
        irodoritts: {
          baseURL: (value: string) => {
            try {
              const url = new URL(value);
              if (url.protocol !== "http:" && url.protocol !== "https:") {
                return "Invalid URL";
              }
              return null;
            } catch {
              return "Invalid URL";
            }
          },
        },
      },
      avatar: {
        waiting: {
          path: isNotEmpty(),
        },
        states: {
          key: isNotEmpty(),
          path: isNotEmpty(),
        },
      },
    },
  });

  useEffect(() => {
    setLoading(true);
    window.electron.ipcRenderer.send("config:ready");
    window.api.getAppVersion().then(setAppVersion);
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on("config:set", (_, config, isDefaultConfig) => {
      const values = {
        mcp: {
          host: config.mcp.host,
          port: config.mcp.port,
          restAPI: config.mcp.restAPI,
        },
        tts: {
          provider: config.tts.provider,
          maxQueueWaitTime: config.tts.maxQueueWaitTime,
          webSpeechAPI: {
            lang: config.tts.webSpeechAPI.lang,
            volume: config.tts.webSpeechAPI.volume * 100,
            pitch: (config.tts.webSpeechAPI.pitch - 1) * 100,
            rate: config.tts.webSpeechAPI.rate * 100,
          },
          voicevox: {
            baseURL: config.tts.voicevox.baseURL,
            speakerID: config.tts.voicevox.speakerID,
            volume: config.tts.voicevox.volume * 100,
            pitch: config.tts.voicevox.pitch * 100,
            rate: config.tts.voicevox.rate * 100,
          },
          irodoritts: {
            baseURL: config.tts.irodoritts.baseURL,
            voice: config.tts.irodoritts.voice,
            caption: config.tts.irodoritts.caption,
            volume: config.tts.irodoritts.volume * 100,
            rate: config.tts.irodoritts.rate * 100,
          },
        },
        avatar: {
          mirror: config.avatar.mirror,
          animation: config.avatar.animation,
          opacity: config.avatar.opacity * 100,
          ignoreMouseEvents: config.avatar.ignoreMouseEvents,
          waiting: { ...config.avatar.waiting },
          states: config.avatar.states.map((state) => ({ ...state, id: crypto.randomUUID() })),
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
            maxQueueWaitTime: values.tts.maxQueueWaitTime,
            webSpeechAPI: {
              lang: values.tts.webSpeechAPI.lang,
              volume: values.tts.webSpeechAPI.volume / 100,
              pitch: (values.tts.webSpeechAPI.pitch + 100) / 100,
              rate: values.tts.webSpeechAPI.rate / 100,
            },
            voicevox: {
              baseURL: values.tts.voicevox.baseURL,
              speakerID: values.tts.voicevox.speakerID,
              volume: values.tts.voicevox.volume / 100,
              pitch: values.tts.voicevox.pitch / 100,
              rate: values.tts.voicevox.rate / 100,
            },
            irodoritts: {
              baseURL: values.tts.irodoritts.baseURL,
              voice: values.tts.irodoritts.voice,
              caption: values.tts.irodoritts.caption,
              volume: values.tts.irodoritts.volume / 100,
              rate: values.tts.irodoritts.rate / 100,
            },
          },
          avatar: {
            mirror: values.avatar.mirror,
            animation: values.avatar.animation,
            opacity: values.avatar.opacity / 100,
            ignoreMouseEvents: values.avatar.ignoreMouseEvents,
            waiting: { ...values.avatar.waiting },
            states: values.avatar.states
              .filter((state) => state.key.trim() !== "" && state.path.trim() !== "")
              .map((state) => ({ key: state.key, description: state.description, path: state.path })),
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
          <Tabs.Tab value="about">About</Tabs.Tab>
        </Tabs.List>

        <ConfigTabsPanel value="mcp" isChanged={!form.isDirty()} isValid={form.isValid()}>
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

          <InputLabel mt="sm">REST API</InputLabel>
          <InputDescription>
            When enabled, clients other than AI agents will be able to use yak-mcp's speech functionality via the REST
            API.
            <br />
            The REST API endpoint is POST http://localhost:{form.values.mcp.port}/say, and the body should contain JSON
            similar to the following: <Code>{`{text: "hello", state: "waiting"}`}</Code>
          </InputDescription>
          <Select
            data={[
              { label: "Disabled", value: "disabled" },
              { label: "Enabled", value: "enabled" },
            ]}
            clearable={false}
            value={form.values.mcp.restAPI ? "enabled" : "disabled"}
            onChange={(restAPI) => {
              if (!restAPI) {
                return;
              }
              form.setFieldValue("mcp.restAPI", restAPI === "enabled");
            }}
          />
        </ConfigTabsPanel>

        <ConfigTabsPanel value="tts" isChanged={!form.isDirty()} isValid={form.isValid()}>
          <InputLabel>TTS Provider</InputLabel>
          <InputDescription>Select a text-to-speech provider.</InputDescription>
          <Select
            data={[
              { label: "Web Speech API", value: "webSpeechAPI" },
              { label: "VOICEVOX / AivisSpeech", value: "voicevox" },
              { label: "Irodori-TTS", value: "irodori-tts" },
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

          <InputLabel mt="sm">Maximum Queue Wait Time</InputLabel>
          <InputDescription>
            Maximum time a speech request can wait in the queue before it is discarded. Requests that exceed this limit
            will be skipped.
          </InputDescription>
          <Select
            data={[
              { value: "5000", label: "5 seconds" },
              { value: "10000", label: "10 seconds" },
              { value: "15000", label: "15 seconds" },
              { value: "30000", label: "30 seconds" },
              { value: "60000", label: "1 minute" },
              { value: "180000", label: "3 minutes" },
              { value: "300000", label: "5 minutes" },
              { value: "600000", label: "10 minutes" },
              { value: "0", label: "Unlimited" },
            ]}
            allowDeselect={false}
            value={Math.trunc(form.values.tts.maxQueueWaitTime).toString()}
            onChange={(value) => {
              if (value === null) {
                return;
              }
              form.setFieldValue("tts.maxQueueWaitTime", Number(value));
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
              <Slider
                mb="md"
                min={1}
                max={200}
                marks={[
                  { value: 1, label: "x0.01" }, // 0.01
                  { value: 100, label: "x1.0" }, // 1
                  { value: 200, label: "x2.0" }, // 2
                ]}
                label={(value) => `x${(value / 100).toFixed(2)}`}
                value={form.values.tts.webSpeechAPI.rate}
                onChange={(value) => form.setFieldValue("tts.webSpeechAPI.rate", value)}
              />
            </Fieldset>
          )}

          {form.values.tts.provider === "voicevox" && (
            <Fieldset legend="VOICEVOX / AivisSpeech Settings" my="sm">
              <InputLabel>Base URL</InputLabel>
              <InputDescription>
                Enter the base URL for the VOICEVOX engine / AivisSpeech engine.
                <br />
                See: https://github.com/VOICEVOX/voicevox_engine or https://github.com/aivis-project/AivisSpeech-Engine
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
              <Slider
                mb="md"
                min={50}
                max={200}
                marks={[
                  { value: 50, label: "x0.5" }, // 0.5
                  { value: 100, label: "x1.0" }, // 1
                  { value: 200, label: "x2.0" }, // 2
                ]}
                label={(value) => `x${(value / 100).toFixed(2)}`}
                value={form.values.tts.voicevox.rate}
                onChange={(value) => form.setFieldValue("tts.voicevox.rate", value)}
              />
            </Fieldset>
          )}

          {form.values.tts.provider === "irodori-tts" && (
            <Fieldset legend="Irodori-TTS Settings" my="sm">
              <InputLabel>Base URL</InputLabel>
              <InputDescription>
                URL of the Irodori-TTS-Server.
                <br />
                See: https://github.com/Aratako/Irodori-TTS-Server
                <br />
                And add the following to your .env file:
                <br />
                <Code>IRODORI_CORS_ORIGINS='["*"]'</Code>
              </InputDescription>
              <TextInput
                placeholder="http://localhost:8088"
                key={form.key("tts.irodoritts.baseURL")}
                {...form.getInputProps("tts.irodoritts.baseURL")}
              />

              <InputLabel mt="sm">Reference Voice</InputLabel>
              <InputDescription>
                Selects the reference voice used for speech synthesis. Leave empty to generate speech without a
                reference voice.
                <br />
                See:{" "}
                {form.values.tts.irodoritts.baseURL.trim()
                  ? `${form.values.tts.irodoritts.baseURL.trim()}/v1/audio/voices`
                  : "http://localhost:8088/v1/audio/voices"}
              </InputDescription>
              <TextInput
                placeholder=""
                key={form.key("tts.irodoritts.voice")}
                value={form.values.tts.irodoritts.voice ?? ""}
                onChange={(value) => {
                  const voice = value.currentTarget.value.trim();
                  form.setFieldValue("tts.irodoritts.voice", voice === "" ? null : voice);
                }}
              />

              <InputLabel mt="sm">Caption</InputLabel>
              <InputDescription>
                Describes the desired voice characteristics, speaking style, and emotions.
              </InputDescription>
              <Textarea
                autosize
                minRows={4}
                placeholder=""
                key={form.key("tts.irodoritts.caption")}
                {...form.getInputProps("tts.irodoritts.caption")}
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
                value={form.values.tts.irodoritts.volume}
                onChange={(value) => form.setFieldValue("tts.irodoritts.volume", value)}
              />

              <InputLabel mt="sm">Rate</InputLabel>
              <Slider
                mb="md"
                min={25}
                max={400}
                marks={[
                  { value: 25, label: "x0.25" }, // 0.25
                  { value: 100, label: "x1.0" }, // 1
                  { value: 200, label: "x2.0" }, // 2
                  { value: 300, label: "x3.0" }, // 3
                  { value: 400, label: "x4.0" }, // 4
                ]}
                label={(value) => `x${(value / 100).toFixed(2)}`}
                value={form.values.tts.irodoritts.rate}
                onChange={(value) => form.setFieldValue("tts.irodoritts.rate", value)}
              />
            </Fieldset>
          )}
        </ConfigTabsPanel>

        <ConfigTabsPanel value="avatar" isChanged={!form.isDirty()} isValid={form.isValid()}>
          <InputLabel>Mirror</InputLabel>
          <InputDescription>The avatar image will be displayed horizontally flipped.</InputDescription>
          <Select
            data={[
              { label: "Disabled", value: "disabled" },
              { label: "Enabled", value: "enabled" },
            ]}
            clearable={false}
            value={form.values.avatar.mirror ? "enabled" : "disabled"}
            onChange={(mirror) => {
              if (!mirror) {
                return;
              }
              form.setFieldValue("avatar.mirror", mirror === "enabled");
            }}
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

          <InputLabel mt="sm">Opacity</InputLabel>
          <Slider
            mb="md"
            min={0}
            max={100}
            marks={[
              { value: 0, label: "0%" }, // 0
              { value: 50, label: "50%" }, // 0.5
              { value: 100, label: "100%" }, // 1
            ]}
            value={form.values.avatar.opacity}
            onChange={(value) => form.setFieldValue("avatar.opacity", value)}
          />

          <InputLabel mt="sm">Ignore mouse events</InputLabel>
          <InputDescription>
            When enabled, all mouse operations on the avatar window will be transparent to the window behind it.
            <br />
            Disable this setting if you want to move the avatar window.
          </InputDescription>
          <Select
            data={[
              { label: "Disabled", value: "disabled" },
              { label: "Enabled", value: "enabled" },
            ]}
            clearable={false}
            value={form.values.avatar.ignoreMouseEvents ? "enabled" : "disabled"}
            onChange={(ignoreMouseEvents) => {
              if (!ignoreMouseEvents) {
                return;
              }
              form.setFieldValue("avatar.ignoreMouseEvents", ignoreMouseEvents === "enabled");
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

            {form.values.avatar.states.map((state, i) => (
              <React.Fragment key={state.id}>
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
              </React.Fragment>
            ))}

            <Group justify="flex-start" my="sm">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  form.insertListItem("avatar.states", { id: crypto.randomUUID(), key: "", description: "", path: "" });
                }}
              >
                Add
              </Button>
            </Group>
          </Fieldset>
        </ConfigTabsPanel>

        <ConfigTabsPanel value="about" isChanged={!form.isDirty()} isValid={form.isValid()}>
          <Stack align="center">
            <Title order={2}>yak-mcp</Title>
            <AppIcon />
            <Table maw={360}>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Version</Table.Td>
                  <Table.Td>{appVersion}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>License</Table.Td>
                  <Table.Td>MIT</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Repository</Table.Td>
                  <Table.Td>https://github.com/thamaji/yak-mcp</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Stack>
        </ConfigTabsPanel>
      </Tabs>
    </form>
  );
};

const ConfigTabsPanel: React.FC<React.PropsWithChildren<{ value: string; isChanged: boolean; isValid: boolean }>> = ({
  value,
  isChanged,
  isValid,
  children,
}) => (
  <Tabs.Panel value={value}>
    <ScrollArea h="calc(100vh - 50px)" py="5px" px="10px" type="auto" offsetScrollbars="y" scrollbars="y">
      {children}
    </ScrollArea>
    <Group h="50px" justify="flex-end" py="5px" px="10px">
      <Button type="submit" disabled={isChanged || !isValid}>
        Save
      </Button>
    </Group>
  </Tabs.Panel>
);

const AppIcon: React.FC = () => (
  <img
    width="96"
    height="96"
    alt=""
    src="data:image/png;base64,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880330z5sP/Fggsu2G2OOeYYtMACC4Qdd9wxHH744aFHjx7hiCOOiNtxxx0Xdt999zDXXHOFOeecMyy33HJtjo+p7eijjw4nnHBCOOmkk8IxxxxT9RybZzWmHXbYIWSTaAwDF1544a5x8Isttth02eCHrLTSSuHVV18N1TBkyJCw8cYbh2zmQ8ZmvNnYgJ9++instttu4cwzz8z31Effvn3DiiuuGLIxD+7Spcu0LXPPPXfPzKzDa6+9lp/SFga/5pprhsyUQmY6ITs/vPvuu/nRMYsnnngiTD755GGaaaYJa6+9dvjmm2/yI8Uw0Zm7G0uPlplnnrnvVlttlR8aHgcffHCYbrrpAvfI4kAoOnd047fffouTwy1Z5jrrrBMnrAyMIxv7yy3ZDz/dd999891t8cwzz4QseES2zD4r6N27d3507MDpp58eB2+Cpp122jhhZWDMxt6SDWrAPvvsk+9ui8033zxkkTMOfqGFFoo3uuSSS/KjYweefPLJMMsss8Rn5MomzMTVgzEbe00CXn/99Wjys846a2Sra9eu0dfGNgI+/PDDOHgbS83MOmy22Wb50dqoS8Bpp50WTcqF33jjjRhkpp566nDsscfmZ4wd+Prrr0OmYeJzbr/99jFIm7hXXnklP6M66hKw9dZbxxnfZJNN4t/bbrttJESgaTYGDx4cfvzxx/DPP//ke8rj888/j+7JUu+5556w7rrrhimnnDLqgyIUEiC60gVmnIiACy64IBLA36SfMvj999/Do48+GoXK3nvvHW966qmnhhdffDEMHDgwXHvttTHOLLvssmHJJZeMEf3EE08M3377bX6F+pDXzbhtwIAB4YwzzoipkW4pQiEBZsMDIUCUhS+//DIyzceQ45wi3H777WGVVVaJQWn66adv3aRUgsqgXQupLM2n4z6XWmqp8PLLL+dXKobn83vP+/fff4eHHnqo9RqEUi00TABcfvnl8WYenKl98skn+ZFh+OOPP8KBBx4YByODZNenukImPeM2++yzx30syXW4VM+ePaO63GijjeJM2r/EEktEyxFzLr300vDRRx/ldxgG5s//PdN+++0X97EI7iAmfPzxx3FfNRQS8Ouvv0a5iIAjjzwy3/svDj300FYSPKSH+/777/OjIey6667xuIegu9URTP6LL76I2/PPPx+vkUnw+Ns///wz/+W/uOGG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"
  />
);
