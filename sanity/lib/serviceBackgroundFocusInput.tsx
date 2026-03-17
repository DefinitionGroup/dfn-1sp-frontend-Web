import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import {
  ObjectInputMembers,
  ObjectInputProps,
  PatchEvent,
  set,
  setIfMissing,
} from "sanity";

type CloudinaryImageValue = {
  asset?: {
    secure_url?: string;
    url?: string;
  } | null;
  alt?: string;
  focusMode?: "auto" | "manual";
  focusX?: number;
  focusY?: number;
};

const HIDDEN_MEMBER_NAMES = new Set(["focusMode", "focusX", "focusY"]);

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg|avi|mkv)(\?.*)?$/i.test(url) || url.includes("/video/");
}

function cloudinaryVideoPosterUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (!url.includes("/upload/")) return undefined;

  const transforms = ["q_auto", "f_auto", "so_auto", "w_1200"];
  const transformStr = transforms.join(",");
  const withTransforms = url.replace(/\/upload\//, `/upload/${transformStr}/`);

  return withTransforms.replace(
    /\.(mp4|mov|webm|avi|mkv|ogg)(\?.*)?$/i,
    ".jpg$2"
  );
}

function clampFocus(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function roundFocus(value: number): number {
  return Math.round(value * 10) / 10;
}

function getRelativeFocus(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { focusX: number; focusY: number } {
  const focusX = ((clientX - rect.left) / rect.width) * 100;
  const focusY = ((clientY - rect.top) / rect.height) * 100;

  return {
    focusX: roundFocus(clampFocus(focusX)),
    focusY: roundFocus(clampFocus(focusY)),
  };
}

const buttonBaseStyle: React.CSSProperties = {
  appearance: "none",
  borderRadius: 999,
  border: "1px solid var(--card-border-color)",
  padding: "0.4rem 0.8rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  color: "inherit",
};

function getButtonStyle(active: boolean): React.CSSProperties {
  if (active) {
    return {
      ...buttonBaseStyle,
      background: "var(--card-focus-ring-color)",
      borderColor: "var(--card-focus-ring-color)",
      color: "var(--card-bg-color)",
    };
  }

  return buttonBaseStyle;
}

export function ServiceBackgroundFocusInput(
  props: ObjectInputProps<CloudinaryImageValue>
) {
  const { members, onChange, schemaType, value } = props;
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const mediaUrl = value?.asset?.secure_url || value?.asset?.url;
  const isVideoAsset = isVideoUrl(mediaUrl);
  const posterUrl = isVideoAsset ? cloudinaryVideoPosterUrl(mediaUrl) : undefined;
  const previewImageUrl = posterUrl || mediaUrl;
  const focusMode = value?.focusMode === "manual" ? "manual" : "auto";
  const focusX = clampFocus(value?.focusX);
  const focusY = clampFocus(value?.focusY);

  const visibleMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.kind !== "field" || !HIDDEN_MEMBER_NAMES.has(member.name)
      ),
    [members]
  );

  const patchObjectBase = useCallback(() => {
    onChange(
      PatchEvent.from(setIfMissing({ _type: schemaType.name }))
    );
  }, [onChange, schemaType.name]);

  const setAutoMode = useCallback(() => {
    patchObjectBase();
    onChange(PatchEvent.from(set("auto", ["focusMode"])));
  }, [onChange, patchObjectBase]);

  const setManualMode = useCallback(() => {
    onChange(
      PatchEvent.from([
        setIfMissing({ _type: schemaType.name }),
        set("manual", ["focusMode"]),
        setIfMissing(50, ["focusX"]),
        setIfMissing(50, ["focusY"]),
      ])
    );
  }, [onChange, schemaType.name]);

  const updateFocusFromEvent = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nextFocus = getRelativeFocus(event.clientX, event.clientY, rect);

      onChange(
        PatchEvent.from([
          setIfMissing({ _type: schemaType.name }),
          set("manual", ["focusMode"]),
          set(nextFocus.focusX, ["focusX"]),
          set(nextFocus.focusY, ["focusY"]),
        ])
      );
    },
    [onChange, schemaType.name]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFocusFromEvent(event);
    },
    [updateFocusFromEvent]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      updateFocusFromEvent(event);
    },
    [updateFocusFromEvent]
  );

  const stopDragging = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    []
  );

  return (
    <Stack space={4}>
      <ObjectInputMembers
        members={visibleMembers}
        renderAnnotation={props.renderAnnotation}
        renderBlock={props.renderBlock}
        renderField={props.renderField}
        renderInlineBlock={props.renderInlineBlock}
        renderInput={props.renderInput}
        renderItem={props.renderItem}
        renderPreview={props.renderPreview}
      />

      <Card padding={3} radius={2} border>
        <Stack space={4}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Stack space={2}>
              <Text weight="semibold">Gallery focus</Text>
              <Text size={1} muted>
                Drag the point to control what stays visible in the Services
                gallery crop.
              </Text>
            </Stack>

            <Flex gap={2} wrap="wrap">
              <button
                type="button"
                onClick={setAutoMode}
                style={getButtonStyle(focusMode === "auto")}
              >
                Auto / center
              </button>
              <button
                type="button"
                onClick={setManualMode}
                style={getButtonStyle(focusMode === "manual")}
              >
                Manual
              </button>
            </Flex>
          </Flex>

          {mediaUrl ? (
            <Stack space={3}>
              <Card padding={2} radius={2} border>
                <Box
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  style={{
                    position: "relative",
                    cursor: isDragging ? "grabbing" : "crosshair",
                    touchAction: "none",
                    userSelect: "none",
                  }}
                >
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt={value?.alt || ""}
                      draggable={false}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <video
                      src={mediaUrl}
                      muted
                      loop
                      playsInline
                      autoPlay
                      style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                        borderRadius: 6,
                      }}
                    />
                  )}

                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: `${focusX}%`,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: "rgba(255,255,255,0.65)",
                        transform: "translateX(-0.5px)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: `${focusY}%`,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: "rgba(255,255,255,0.65)",
                        transform: "translateY(-0.5px)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: `${focusX}%`,
                        top: `${focusY}%`,
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: "2px solid white",
                        background: "rgba(0,0,0,0.35)",
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </Box>
              </Card>

              <Card padding={2} radius={2} border>
                <Stack space={2}>
                  <Text size={1} weight="semibold">
                    Gallery crop preview
                  </Text>
                  <Box
                    style={{
                      width: "100%",
                      aspectRatio: "3 / 2",
                      borderRadius: 6,
                      overflow: "hidden",
                      position: "relative",
                      background: "var(--card-code-bg-color)",
                    }}
                  >
                    {isVideoAsset ? (
                      <video
                        src={mediaUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: `${focusX}% ${focusY}%`,
                        }}
                      />
                    ) : previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt=""
                        draggable={false}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: `${focusX}% ${focusY}%`,
                        }}
                      />
                    ) : null}
                  </Box>
                  <Text size={1} muted>
                    {focusMode === "manual"
                      ? `Manual focus at ${focusX}% / ${focusY}%`
                      : "Auto mode uses the default center crop. Dragging the image switches to manual."}
                  </Text>
                  {isVideoAsset ? (
                    <Text size={1} muted>
                      Video backgrounds use the same focal-point data as images.
                      The drag surface uses a poster frame, and the crop preview
                      uses the video itself when available.
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Text size={1} muted>
              Select an image above to place the focal point.
            </Text>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
