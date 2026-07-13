import { useEffect, useRef } from "react";
import { motion, useTransform, useMotionTemplate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { videoWindow } from "../worldTimeline.js";
import { useWorldProgress } from "./useWorldProgress.js";

/**
 * VideoSequence — the film chapter. Three floating screens, one at a time.
 *
 * Each video rises out of the dark, sharp and bright, holds the frame, then
 * gracefully loses it to the next: opacity falls, focus blurs, brightness
 * dies and it drifts up — professional film editing, no hard cuts anywhere.
 *
 * Footage comes from src/assets/videos (bundled by glob). With fewer files
 * than moments the available footage loops across them, so the sequence
 * upgrades itself automatically when more films are dropped in. Videos are
 * muted (autoplay-safe) and imperatively played/paused from scroll — only
 * the moment on stage ever decodes frames.
 */
const SOURCES = Object.values(
  import.meta.glob("../../assets/videos/*.{mp4,webm,mov}", {
    eager: true,
    import: "default",
  })
);

const MOMENTS = 3;

const VideoMoment = ({ index, src, caption, progress }) => {
  const [a, b] = videoWindow(index, MOMENTS);
  const span = b - a;
  const last = index === MOMENTS - 1;
  const videoRef = useRef(null);

  /* enter fast and clean; exit long and soft under the next moment */
  const inEnd = a + span * 0.3;
  const outEnd = last ? b + span * 0.18 : b + span * 0.45;
  const opacity = useTransform(
    progress,
    [a, inEnd, b - span * 0.05, last ? b : b + span * 0.2, outEnd],
    [0, 1, 1, last ? 0.4 : 0.28, 0]
  );
  const y = useTransform(progress, [a, inEnd, outEnd], ["16vh", "0vh", "-9vh"]);
  const scale = useTransform(progress, [a, inEnd, outEnd], [0.9, 1, 1.06]);
  const blurPx = useTransform(
    progress,
    [a, a + span * 0.26, b - span * 0.05, outEnd],
    [14, 0, 0, 12]
  );
  const bright = useTransform(
    progress,
    [a, inEnd, b - span * 0.05, outEnd],
    [0.6, 1, 1, 0.35]
  );
  const filter = useMotionTemplate`blur(${blurPx}px) brightness(${bright})`;
  const captionOpacity = useTransform(
    progress,
    [a + span * 0.18, a + span * 0.38, b - span * 0.18, b],
    [0, 1, 1, 0]
  );

  /* scroll-driven playback — only the on-stage film burns decode time */
  useEffect(() => {
    let playing = false;
    const drive = (p) => {
      const v = videoRef.current;
      if (!v) return;
      const onStage = p > a - span * 0.25 && p < outEnd + span * 0.1;
      if (onStage && !playing) {
        playing = true;
        v.play().catch(() => {});
      } else if (!onStage && playing) {
        playing = false;
        v.pause();
      }
    };
    drive(progress.get());
    return progress.on("change", drive);
  }, [progress, a, span, outEnd]);

  return (
    <motion.div
      style={{ opacity, y, scale, zIndex: index }}
      className="absolute flex flex-col items-center gap-5"
    >
      {/* ambient light the screen casts into the dark */}
      <div
        aria-hidden="true"
        className="absolute -inset-16 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(47,191,95,0.16) 0%, transparent 70%)",
        }}
      />
      <motion.div
        style={{ filter }}
        className="w-[min(78vw,58rem)] overflow-hidden rounded-2xl border border-neon/15 bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9),0_0_80px_-30px_rgba(47,191,95,0.45)]"
      >
        <div className="aspect-video">
          {src ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={src}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            /* no footage bundled — a still cinematic wash keeps the beat */
            <div
              className="h-full w-full"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 40%, #0a2418 0%, #04120b 55%, #010805 100%)",
              }}
            />
          )}
        </div>
      </motion.div>
      <motion.p
        style={{ opacity: captionOpacity }}
        className="font-mono text-xs uppercase tracking-[0.4em] text-lime"
      >
        {caption}
      </motion.p>
    </motion.div>
  );
};

const VideoSequence = () => {
  const { t } = useTranslation();
  const progress = useWorldProgress();
  const captions = t("world.videos", { returnObjects: true });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 flex items-center justify-center"
    >
      {Array.from({ length: MOMENTS }, (_, i) => (
        <VideoMoment
          key={i}
          index={i}
          src={SOURCES.length ? SOURCES[i % SOURCES.length] : null}
          caption={Array.isArray(captions) ? captions[i]?.caption : ""}
          progress={progress}
        />
      ))}
    </div>
  );
};

export default VideoSequence;
