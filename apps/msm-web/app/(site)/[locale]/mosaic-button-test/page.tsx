// Temporary visual test page for MosaicButton — safe to delete.
import MosaicButton from "@msm/components/ui/MosaicButton";

export default function MosaicButtonTestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0a0c0d] p-12">
      <div className="flex flex-wrap items-center gap-6">
        <MosaicButton text="Idle ambient" />
        <MosaicButton text="Idle no wireframe" wireframe={false} />
        <MosaicButton text="Idle fine tiles" tileRows={3} />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <MosaicButton defaultFilled text="Filled mosaic" />
        <MosaicButton defaultFilled text="Filled fine tiles" tileRows={3} />
        <MosaicButton defaultFilled size="lg" text="Filled large" />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <MosaicButton size="sm" text="Small" />
        <MosaicButton href="/en" text="As link" />
        <MosaicButton showArrow={false} text="No arrow" />
      </div>
    </main>
  );
}
