import { AssetShowcase, PageIntro } from "@/components/commerce";
import { designTokens, stitchScreens } from "@/lib/stitch";

export default function DesignSystemPage() {
  return (
    <div className="content-shell space-y-10">
      <PageIntro
        description="The shared visual language uses the Stitch design system: tonal layering, editorial spacing, and a warm commerce gradient instead of generic marketplace chrome."
        eyebrow="Design System"
        title="Kinetic Marketplace tokens"
      />

      <section className="grid gap-4 md:grid-cols-4">
        {Object.entries(designTokens).map(([name, value]) => (
          <div className="rounded-[1.5rem] bg-white p-4 shadow-[0_16px_40px_rgba(45,47,47,0.06)]" key={name}>
            <div className="h-24 rounded-2xl" style={{ backgroundColor: value }} />
            <p className="mt-4 text-sm font-semibold capitalize text-[--ink]">{name}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[--muted]">{value}</p>
          </div>
        ))}
      </section>

      <AssetShowcase images={stitchScreens} />
    </div>
  );
}

