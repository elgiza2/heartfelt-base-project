import {
  ImagePlus,
  Code2,
  Video as VideoIcon,
  Presentation,
  ScanSearch,
  FileText,
  Plug,
} from "lucide-react";

export interface StarterCardsProps {
  /** Activates the service chip for the picked card. */
  onPick: (prompt: string, mode?: string) => void;
  className?: string;
}

/** Every real service the app offers — no filler. Short labels, no descriptions. */
const CARDS = [
  {
    id: "image",
    mode: "images",
    Icon: ImagePlus,
    title: "Images",
  },
  {
    id: "web",
    mode: "code",
    Icon: Code2,
    title: "Website",
  },
  {
    id: "video",
    mode: "video",
    Icon: VideoIcon,
    title: "Video",
  },
  {
    id: "slides",
    mode: "slides",
    Icon: Presentation,
    title: "Slides",
  },
  {
    id: "research",
    mode: "deep-research",
    Icon: ScanSearch,
    title: "Research",
  },
  {
    id: "docs",
    mode: "docs",
    Icon: FileText,
    title: "Documents",
  },
  {
    id: "integrations",
    Icon: Plug,
    title: "Integrations",
  },
];

const handleCardClick = (
  c: (typeof CARDS)[number],
  onPick: StarterCardsProps["onPick"],
) => {
  if (c.id === "integrations") {
    window.dispatchEvent(new CustomEvent("megsy:open-integrations"));
    return;
  }
  onPick("", (c as { mode?: string }).mode);
};

/** Desktop-only: compact icon chips shown below the composer (no images). */
export function StarterChips({ onPick, className = "" }: StarterCardsProps) {
  return (
    <div
      className={`hidden md:flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      {CARDS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => handleCardClick(c, onPick)}
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white hover:bg-white/90 active:scale-[0.98] transition-all px-3.5 h-8 shadow-sm"
        >
          <c.Icon className="w-[14px] h-[14px] text-black/60 shrink-0" strokeWidth={1.9} />
          <span className="text-[12.5px] font-medium text-black/75 whitespace-nowrap">
            {c.title}
          </span>
        </button>
      ))}
    </div>
  );
}

export function StarterCards({ onPick, className = "" }: StarterCardsProps) {
  return (
    <div className={`w-full md:hidden ${className}`}>
      <div className="flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x">
        {CARDS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleCardClick(c, onPick)}
            className="snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background hover:bg-accent/60 active:scale-[0.98] transition-all px-2.5 h-8 shadow-sm"
          >
            <c.Icon className="w-[14px] h-[14px] text-foreground/70 shrink-0" strokeWidth={1.9} />
            <span className="text-[12px] font-medium text-foreground whitespace-nowrap">
              {c.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default StarterCards;
