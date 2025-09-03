import {
  Button,
  Fieldset,
  Group,
  InputLabel,
  LoadingOverlay,
  NumberInput,
  Select,
  Slider,
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
        lang: "ja-JP",
        volume: 100,
        pitch: 0,
        rate: 1.0,
      },
    },
    validate: {
      mcp: {
        host: matches(
          /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/,
        ),
        port: isNotEmpty(),
      },
      tts: {},
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
          lang: config.tts.lang,
          volume: config.tts.volume * 100,
          pitch: (config.tts.pitch - 1) * 100,
          rate: config.tts.rate,
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
      style={{
        padding: "var(--mantine-spacing-sm)",
        overflowX: "hidden",
      }}
      onSubmit={form.onSubmit((values) => {
        window.electron.ipcRenderer.send("config:update", {
          mcp: {
            host: values.mcp.host,
            port: values.mcp.port,
          },
          tts: {
            lang: values.tts.lang,
            volume: values.tts.volume / 100,
            pitch: (values.tts.pitch + 100) / 100,
            rate: values.tts.rate,
          },
        });
        form.resetDirty(values);
      })}
    >
      <LoadingOverlay visible={loading} />

      <Fieldset legend="MCP Server">
        <InputLabel>Host</InputLabel>
        <TextInput key={form.key("mcp.host")} {...form.getInputProps("mcp.host")} />

        <InputLabel mt="sm">Port</InputLabel>
        <NumberInput min={0} max={65535} hideControls key={form.key("mcp.port")} {...form.getInputProps("mcp.port")} />
      </Fieldset>

      <Fieldset legend="TTS" mt="sm">
        <InputLabel>Lang</InputLabel>
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
          value={form.values.tts.lang}
          onChange={(value) => {
            if (value === null) {
              return;
            }
            form.setFieldValue("tts.lang", value);
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
          value={form.values.tts.volume}
          onChange={(value) => form.setFieldValue("tts.volume", value)}
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
          value={form.values.tts.pitch}
          onChange={(value) => form.setFieldValue("tts.pitch", value)}
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
          value={form.values.tts.rate.toFixed(2)}
          onChange={(value) => {
            if (value === null) {
              return;
            }
            form.setFieldValue("tts.rate", parseFloat(value));
          }}
        />
      </Fieldset>

      <Group justify="flex-end" mt="md">
        <Button type="submit" disabled={!form.isDirty()}>
          保存
        </Button>
      </Group>
    </form>
  );
};
