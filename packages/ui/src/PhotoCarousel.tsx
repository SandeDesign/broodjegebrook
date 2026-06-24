"use client";
import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./cn";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export type CarouselPhoto = {
  src: string | null;
  alt: string;
};

export interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  className?: string;
  autoplay?: boolean;
  aspect?: "video" | "square" | "wide";
  rounded?: boolean;
}

const aspectClass = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[16/7]",
} as const;

export function PhotoCarousel({
  photos,
  className,
  autoplay = true,
  aspect = "video",
  rounded = true,
}: PhotoCarouselProps) {
  const plugins = React.useMemo(
    () => (autoplay ? [Autoplay({ delay: 4500, stopOnInteraction: false })] : []),
    [autoplay],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, plugins);
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = React.useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  if (photos.length === 0) {
    return <PhotoPlaceholder label="Eufraat" className={cn(rounded && "rounded-2xl", className)} aspect={aspect === "square" ? "square" : "video"} />;
  }

  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn("overflow-hidden", rounded && "rounded-2xl")}
        ref={emblaRef}
      >
        <div className="flex">
          {photos.map((p, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%]">
              {p.src ? (
                <img
                  src={p.src}
                  alt={p.alt}
                  className={cn("h-full w-full object-cover", aspectClass[aspect])}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : (
                <PhotoPlaceholder label={p.alt} aspect={aspect === "square" ? "square" : "video"} />
              )}
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Vorige foto"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-eufraat-800 shadow-md opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Volgende foto"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-eufraat-800 shadow-md opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Ga naar foto ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  selected === i ? "w-6 bg-white" : "w-2 bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
