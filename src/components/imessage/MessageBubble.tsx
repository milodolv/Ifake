"use client";

import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { wrapBubbleText } from "@/lib/bubbleTextWrap";
import { Message } from "@/lib/types";
import {
  buildBubblePath,
  CornerRadii,
  getSvgSize,
  getSvgViewBox,
  TAIL_DOWN,
  TAIL_OUT,
} from "./bubblePath";
import { IMESSAGE, IMESSAGE_FONT } from "./theme";
import { VideoPlayOverlay } from "./VideoPlayOverlay";

interface MessageBubbleProps {
  message: Message;
  darkMode: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
  sameSenderAsPrev: boolean;
  isFirstInConversation?: boolean;
  isLastMeInConversation?: boolean;
  minMeBodyWidthPx?: number;
  onMeBodyWidthReport?: (width: number) => void;
  /** Ligne de réf. — bulle bleue juste au-dessus (dernière bulle uniquement). */
  lastMeTailAlignRefLine?: string;
}

const CONTACT_BUBBLE_EXTRA_PADDING_Y = 5;
const ME_BUBBLE_EXTRA_PADDING_Y = 4;
const ME_BUBBLE_EXTRA_PADDING_X = 2;
const ME_BUBBLE_EXTRA_PADDING_RIGHT = 5;

/** Même marges que les bulles bleues : texte ancré à gauche (15 px), marge intérieure à droite (20 px). */
function getContactBubblePadding(hasLeftTail: boolean): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const meTextLeft =
    IMESSAGE.bubblePaddingX + ME_BUBBLE_EXTRA_PADDING_X;
  const meTextRight =
    IMESSAGE.bubblePaddingX +
    ME_BUBBLE_EXTRA_PADDING_X +
    ME_BUBBLE_EXTRA_PADDING_RIGHT;

  return {
    top: IMESSAGE.bubblePaddingY + CONTACT_BUBBLE_EXTRA_PADDING_Y,
    bottom: IMESSAGE.bubblePaddingY + CONTACT_BUBBLE_EXTRA_PADDING_Y,
    left: meTextLeft - (hasLeftTail ? TAIL_OUT : 0),
    right: meTextRight,
  };
}

const MESSAGE_TEXT_STYLE = {
  fontSize: IMESSAGE.messageTextFontSize,
  fontWeight: IMESSAGE.messageTextFontWeight,
} as const;

/** Compense une ligne plus longue que la bulle au-dessus (~6 px/car.). */
const LAST_ME_BUBBLE_CHAR_SLACK_PX = 6;
/** Marge visuelle minimale texte ↔ bord droit (dernière bulle bleue). */
const LAST_ME_BUBBLE_MIN_TEXT_RIGHT_SLACK_PX = 3;
/** Réduit le padding droit interne — dernière bulle bleue uniquement. */
const LAST_ME_BUBBLE_TRIM_RIGHT_PADDING_PX = 5;
/** Décalage gauche de la dernière bulle bleue (queue en bas). */
const LAST_ME_BUBBLE_SHIFT_LEFT_PX = 18;

const IMAGE_MAX_HEIGHT = 280;

function ImageMessageBubble({
  src,
  isMe,
  isLastInGroup,
  marginTop,
  showVideoOverlay = true,
}: {
  src: string;
  isMe: boolean;
  isLastInGroup: boolean;
  marginTop: number;
  showVideoOverlay?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [maxWidthPx, setMaxWidthPx] = useState(0);
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number } | null>(
    null
  );

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const update = () => setMaxWidthPx(Math.floor(row.clientWidth * 0.75));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const layoutMaxWidth =
      maxWidthPx || Math.floor(IMESSAGE.screenWidth * 0.75);

    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const scale = Math.min(
        layoutMaxWidth / img.naturalWidth,
        IMAGE_MAX_HEIGHT / img.naturalHeight,
        1
      );
      setDisplaySize({
        w: Math.max(1, Math.round(img.naturalWidth * scale)),
        h: Math.max(1, Math.round(img.naturalHeight * scale)),
      });
    };
    img.onerror = () => {
      if (cancelled) return;
      setDisplaySize({
        w: layoutMaxWidth,
        h: IMAGE_MAX_HEIGHT,
      });
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, maxWidthPx]);

  const r = IMESSAGE.radiusBubble;
  const cornerStyle: CSSProperties = !isLastInGroup
    ? isMe
      ? ME_UNIFORM_PILL_RADIUS
      : CONTACT_UNIFORM_PILL_RADIUS
    : { borderRadius: r };

  return (
    <div
      ref={rowRef}
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      style={{ marginTop }}
    >
      {displaySize ? (
        <div
          style={{
            position: "relative",
            width: displaySize.w,
            height: displaySize.h,
            maxWidth: IMESSAGE.bubbleMaxWidth,
            marginLeft: isMe ? "auto" : CONTACT_BUBBLE_MARGIN_LEFT,
            overflow: "hidden",
            ...cornerStyle,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            style={{
              display: "block",
              width: displaySize.w,
              height: displaySize.h,
            }}
          />
          {showVideoOverlay ? (
            <VideoPlayOverlay
              size={Math.min(
                56,
                Math.max(40, Math.min(displaySize.w, displaySize.h) * 0.22)
              )}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function fullPillCorners(r: number): CornerRadii {
  return { topLeft: r, topRight: r, bottomLeft: r, bottomRight: r };
}
/** Aligne le bord gauche de la bulle contact avec le bouton retour du header. */
const CONTACT_BUBBLE_MARGIN_LEFT =
  IMESSAGE.headerPaddingLeft - IMESSAGE.screenPaddingX;

function getContactPillCorners(
  size: { w: number; h: number },
  corners: CornerRadii
): CornerRadii {
  const pillR = Math.min(size.w / 2, size.h / 2);
  const chain = IMESSAGE.radiusBubbleChain;

  return {
    topLeft: corners.topLeft <= chain ? corners.topLeft : pillR,
    topRight: pillR,
    bottomLeft: corners.bottomLeft <= chain ? corners.bottomLeft : pillR,
    bottomRight: pillR,
  };
}

function getMePillCorners(
  size: { w: number; h: number },
  corners: CornerRadii
): CornerRadii {
  const pillR = Math.min(size.w / 2, size.h / 2);
  const chain = IMESSAGE.radiusBubbleChain;

  return {
    topLeft: pillR,
    topRight: corners.topRight <= chain ? corners.topRight : pillR,
    bottomLeft: pillR,
    bottomRight: corners.bottomRight <= chain ? corners.bottomRight : pillR,
  };
}

function getMePillRadiusStyle(corners: CornerRadii): CSSProperties {
  const chain = IMESSAGE.radiusBubbleChain;

  return {
    borderTopLeftRadius: 9999,
    borderTopRightRadius: corners.topRight <= chain ? corners.topRight : 9999,
    borderBottomLeftRadius: 9999,
    borderBottomRightRadius:
      corners.bottomRight <= chain ? corners.bottomRight : 9999,
  };
}

/** 4 coins identiques — messages « moi » milieu de groupe (sans queue). */
const ME_UNIFORM_PILL_RADIUS: CSSProperties = {
  borderTopLeftRadius: 9999,
  borderTopRightRadius: 9999,
  borderBottomLeftRadius: 9999,
  borderBottomRightRadius: 9999,
};

/** 4 coins identiques — messages contact milieu de groupe (sans queue). */
const CONTACT_UNIFORM_PILL_RADIUS: CSSProperties = {
  borderTopLeftRadius: 9999,
  borderTopRightRadius: 9999,
  borderBottomLeftRadius: 9999,
  borderBottomRightRadius: 9999,
};

function getMeTailBodyRadiusStyle(corners: CornerRadii): CSSProperties {
  const chain = IMESSAGE.radiusBubbleChain;

  return {
    borderTopLeftRadius: 9999,
    borderTopRightRadius: corners.topRight <= chain ? corners.topRight : 9999,
    borderBottomLeftRadius: 9999,
    borderBottomRightRadius: corners.bottomRight <= chain ? corners.bottomRight : 18,
  };
}

function getContactPillRadiusStyle(corners: CornerRadii): CSSProperties {
  const chain = IMESSAGE.radiusBubbleChain;

  return {
    borderTopLeftRadius: corners.topLeft <= chain ? corners.topLeft : 9999,
    borderTopRightRadius: 9999,
    borderBottomLeftRadius: corners.bottomLeft <= chain ? corners.bottomLeft : 9999,
    borderBottomRightRadius: 9999,
  };
}

/** 2 lignes ou plus : rectangle arrondi (pas pilule). */
const MULTILINE_RECT_RADIUS: CSSProperties = {
  borderRadius: IMESSAGE.radiusBubble,
};

const bubbleInnerStyle = (
  bubbleBg: string | undefined,
  textColor: string,
  radius?: CSSProperties,
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  },
  textStyle?: Pick<CSSProperties, "fontSize" | "fontWeight">
): CSSProperties => ({
  position: "relative",
  zIndex: 1,
  boxSizing: "border-box",
  display: "inline-block",
  width: "fit-content",
  maxWidth: "100%",
  paddingTop: padding?.top ?? IMESSAGE.bubblePaddingY,
  paddingBottom: padding?.bottom ?? IMESSAGE.bubblePaddingY,
  paddingLeft: padding?.left ?? IMESSAGE.bubblePaddingX,
  paddingRight: padding?.right ?? IMESSAGE.bubblePaddingX,
  fontSize: textStyle?.fontSize ?? IMESSAGE.messageTextFontSize,
  fontWeight: textStyle?.fontWeight ?? IMESSAGE.messageTextFontWeight,
  fontFamily: IMESSAGE_FONT,
  lineHeight: `${IMESSAGE.messageTextLineHeight}px`,
  color: textColor,
  letterSpacing: IMESSAGE.messageTextLetterSpacing,
  ...(bubbleBg ? { backgroundColor: bubbleBg } : {}),
  ...radius,
});

function measureBubble(node: HTMLDivElement) {
  return {
    w: Math.ceil(Math.max(node.offsetWidth, node.scrollWidth, node.clientWidth)),
    h: Math.ceil(Math.max(node.offsetHeight, node.scrollHeight, node.clientHeight)),
  };
}

function SvgTailBubble({
  bubbleBg,
  textColor,
  corners,
  tailSide,
  marginRight,
  marginLeft,
  padding,
  pillSide,
  rectShape = false,
  textStyle,
  maxWidth = IMESSAGE.bubbleMaxWidth,
  reserveTailPadding = true,
  minBodyWidthPx,
  onBodyMeasure,
  children,
}: {
  bubbleBg: string;
  textColor: string;
  corners: CornerRadii;
  tailSide: "left" | "right";
  marginRight: number;
  marginLeft: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  pillSide?: "left" | "right";
  rectShape?: boolean;
  textStyle?: Pick<CSSProperties, "fontSize" | "fontWeight">;
  maxWidth?: CSSProperties["maxWidth"];
  reserveTailPadding?: boolean;
  minBodyWidthPx?: number;
  onBodyMeasure?: (width: number, height: number) => void;
  children: ReactNode;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const node = bubbleRef.current;
    if (!node) return;

    const updateSize = () => {
      const next = measureBubble(node);
      if (next.w > 0 && next.h > 0) {
        onBodyMeasure?.(next.w, next.h);
        setSize((prev) =>
          prev?.w === next.w && prev?.h === next.h ? prev : next
        );
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    children,
    minBodyWidthPx,
    onBodyMeasure,
    padding.top,
    padding.bottom,
    padding.left,
    padding.right,
    textStyle?.fontSize,
    textStyle?.fontWeight,
  ]);

  const svgSize = size ? getSvgSize(size.w, size.h, tailSide) : null;
  // Pilule (1 ligne) : géométrie pilule pour fusion queue. Rectangle (2+ lignes) : coins fixes.
  const pathCorners =
    rectShape && size
      ? corners
      : pillSide && size
        ? pillSide === "left"
          ? getContactPillCorners(size, corners)
          : getMePillCorners(size, corners)
        : corners;
  const path =
    size && svgSize
      ? buildBubblePath(size.w, size.h, pathCorners, tailSide)
      : "";
  const innerRadius =
    pillSide === "right"
      ? rectShape
        ? undefined
        : getMeTailBodyRadiusStyle(corners)
      : pillSide === "left"
        ? rectShape
          ? undefined
          : getContactPillRadiusStyle(corners)
        : undefined;
  // Pilule : fond CSS interne. Rectangle : fond dédié + SVG au-dessus pour la queue visible.
  const innerBg = pillSide === "right" && !rectShape ? bubbleBg : undefined;

  return (
    <div
      className="relative break-words"
      style={{
        width: "fit-content",
        maxWidth,
        boxSizing: "content-box",
        marginRight,
        marginLeft: tailSide === "right" ? "auto" : marginLeft,
        marginBottom: TAIL_DOWN,
        paddingRight:
          tailSide === "right" && reserveTailPadding ? TAIL_OUT : 0,
        paddingLeft: tailSide === "left" && reserveTailPadding ? TAIL_OUT : 0,
      }}
    >
      {size && rectShape && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.w,
            height: size.h,
            backgroundColor: bubbleBg,
            zIndex: 0,
            pointerEvents: "none",
            ...MULTILINE_RECT_RADIUS,
          }}
        />
      )}
      {size && svgSize && path && (
        <svg
          aria-hidden
          className="absolute top-0 pointer-events-none"
          style={{
            zIndex: rectShape ? 1 : 0,
            left: svgSize.left,
            width: svgSize.width,
            height: svgSize.height,
          }}
          viewBox={getSvgViewBox(size.w, size.h, tailSide)}
          fill="none"
        >
          <path d={path} fill={bubbleBg} stroke="none" />
        </svg>
      )}
      <div
        ref={bubbleRef}
        style={{
          ...bubbleInnerStyle(
            innerBg,
            textColor,
            innerRadius,
            padding,
            textStyle
          ),
          zIndex: rectShape ? 2 : 1,
          ...(minBodyWidthPx ? { minWidth: minBodyWidthPx } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function MessageBubble({
  message,
  darkMode,
  isLastInGroup,
  sameSenderAsPrev,
  isFirstInConversation = false,
  isLastMeInConversation = false,
  minMeBodyWidthPx,
  onMeBodyWidthReport,
  lastMeTailAlignRefLine,
}: MessageBubbleProps) {
  const isMe = message.sender === "me";
  const plainBodyRef = useRef<HTMLDivElement>(null);

  const bubbleBg = isMe
    ? IMESSAGE.blue
    : darkMode
      ? IMESSAGE.bubbleContactDark
      : IMESSAGE.bubbleContactLight;

  const textColor = isMe
    ? "#FFFFFF"
    : darkMode
      ? "#FFFFFF"
      : "#000000";

  const r = IMESSAGE.radiusBubble;

  const corners: CornerRadii = !isLastInGroup
    ? fullPillCorners(r)
    : isMe
      ? {
          topLeft: r,
          topRight: r,
          bottomLeft: r,
          bottomRight: r,
        }
      : {
          topLeft: r,
          topRight: r,
          bottomLeft: r,
          bottomRight: r,
        };

  const showRightTail = isLastInGroup && isMe;
  const showLeftTail = isLastInGroup && !isMe;
  const isGroupedContactTail = showLeftTail && sameSenderAsPrev;

  const marginTop = sameSenderAsPrev
    ? IMESSAGE.spacingSameSender
    : isFirstInConversation
      ? 0
      : IMESSAGE.spacingDiffSender;

  const textLines = wrapBubbleText(message.content);
  const lineCount = textLines.length;
  const isRectShape = lineCount >= 2;

  const shouldAlignLastMeTailRight =
    isLastMeInConversation &&
    isMe &&
    showRightTail &&
    sameSenderAsPrev;

  const currentMaxLineLen = textLines.reduce(
    (max, line) => Math.max(max, line.length),
    0
  );
  const refLineLen = lastMeTailAlignRefLine?.length ?? 0;
  const lastMeTextRightSlackPx = shouldAlignLastMeTailRight
    ? Math.max(
        LAST_ME_BUBBLE_MIN_TEXT_RIGHT_SLACK_PX,
        (currentMaxLineLen - refLineLen) * LAST_ME_BUBBLE_CHAR_SLACK_PX +
          LAST_ME_BUBBLE_MIN_TEXT_RIGHT_SLACK_PX
      )
    : 0;
  const useLastMeWidthSizer =
    shouldAlignLastMeTailRight && !minMeBodyWidthPx && textLines.length > 0;
  const lastMeSizingLine = useLastMeWidthSizer
    ? `${textLines.reduce((widest, line) => (line.length >= widest.length ? line : widest), "")}${"\u00A0".repeat(
        Math.max(2, currentMaxLineLen - refLineLen)
      )}`
    : null;

  const padding = isMe
    ? {
        top: IMESSAGE.bubblePaddingY + ME_BUBBLE_EXTRA_PADDING_Y,
        bottom: IMESSAGE.bubblePaddingY + ME_BUBBLE_EXTRA_PADDING_Y,
        left: IMESSAGE.bubblePaddingX + ME_BUBBLE_EXTRA_PADDING_X,
        right:
          IMESSAGE.bubblePaddingX +
          ME_BUBBLE_EXTRA_PADDING_X +
          ME_BUBBLE_EXTRA_PADDING_RIGHT -
          (shouldAlignLastMeTailRight ? LAST_ME_BUBBLE_TRIM_RIGHT_PADDING_PX : 0),
      }
    : getContactBubblePadding(showLeftTail);

  const content = useLastMeWidthSizer && lastMeSizingLine ? (
    <div style={{ display: "inline-grid", width: "fit-content" }}>
      <span
        aria-hidden
        style={{
          gridArea: "1 / 1",
          visibility: "hidden",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {lastMeSizingLine}
      </span>
      <span
        style={{
          gridArea: "1 / 1",
          position: "relative",
          zIndex: 2,
          whiteSpace: "pre",
        }}
        className="ifake-export-bubble-text"
        data-export-bubble-text
      >
        {textLines.join("\n")}
      </span>
    </div>
  ) : (
    <span
      className="ifake-export-bubble-text"
      data-export-bubble-text
      style={{
        position: "relative",
        zIndex: 2,
        whiteSpace: "pre",
      }}
    >
      {textLines.join("\n")}
    </span>
  );

  useLayoutEffect(() => {
    if (!isMe || !onMeBodyWidthReport || showRightTail || showLeftTail) return;

    const node = plainBodyRef.current;
    if (!node) return;

    const report = () => {
      const width = Math.ceil(node.offsetWidth);
      if (width > 0) onMeBodyWidthReport(width);
    };

    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    isMe,
    onMeBodyWidthReport,
    showRightTail,
    showLeftTail,
    minMeBodyWidthPx,
    message.content,
    message.imageUrl,
    padding.top,
    padding.bottom,
    padding.left,
    padding.right,
  ]);

  const meBodyRadius = isRectShape
    ? MULTILINE_RECT_RADIUS
    : !isLastInGroup
      ? ME_UNIFORM_PILL_RADIUS
      : getMePillRadiusStyle(corners);

  const contactBodyRadius = isRectShape
    ? MULTILINE_RECT_RADIUS
    : !isLastInGroup
      ? CONTACT_UNIFORM_PILL_RADIUS
      : getContactPillRadiusStyle(corners);

  const meTailMarginRight =
    showRightTail && isMe
      ? shouldAlignLastMeTailRight
        ? LAST_ME_BUBBLE_SHIFT_LEFT_PX
        : sameSenderAsPrev
          ? 0
          : 8
      : 0;

  const alignLastMeTail = shouldAlignLastMeTailRight;
  const tailMinBodyWidth =
    alignLastMeTail && minMeBodyWidthPx
      ? minMeBodyWidthPx + lastMeTextRightSlackPx
      : undefined;

  if (message.imageUrl) {
    return (
      <ImageMessageBubble
        src={message.imageUrl}
        isMe={isMe}
        isLastInGroup={isLastInGroup}
        marginTop={marginTop}
        showVideoOverlay={message.showVideoOverlay !== false}
      />
    );
  }

  return (
    <div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      style={{ marginTop }}
    >
      {showRightTail || showLeftTail ? (
        <SvgTailBubble
          bubbleBg={bubbleBg}
          textColor={textColor}
          corners={corners}
          tailSide={showRightTail ? "right" : "left"}
          marginRight={meTailMarginRight}
          marginLeft={showLeftTail ? CONTACT_BUBBLE_MARGIN_LEFT : 0}
          padding={padding}
          pillSide={isMe ? "right" : "left"}
          rectShape={isRectShape}
          textStyle={MESSAGE_TEXT_STYLE}
          maxWidth={isGroupedContactTail ? "100%" : IMESSAGE.bubbleMaxWidth}
          reserveTailPadding={!alignLastMeTail}
          minBodyWidthPx={tailMinBodyWidth}
          onBodyMeasure={
            isMe && onMeBodyWidthReport
              ? (width) => onMeBodyWidthReport(width)
              : undefined
          }
        >
          {content}
        </SvgTailBubble>
      ) : (
        <div
          className="relative break-words"
          style={{
            width: "fit-content",
            maxWidth: IMESSAGE.bubbleMaxWidth,
            marginLeft: isMe ? "auto" : CONTACT_BUBBLE_MARGIN_LEFT,
          }}
        >
          <div
            ref={plainBodyRef}
            style={{
              ...bubbleInnerStyle(
                bubbleBg,
                textColor,
                isMe ? meBodyRadius : contactBodyRadius,
                padding,
                MESSAGE_TEXT_STYLE
              ),
              ...(isMe && minMeBodyWidthPx ? { minWidth: minMeBodyWidthPx } : {}),
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
