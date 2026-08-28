import { MACHINE_IMAGE_SVG, type MachineImageKey } from '@/data/machineAssets';
import { cn } from '@/utils/format';
import { Cog, Factory, Package, ScanLine } from 'lucide-react';
import { useState } from 'react';

const ICONS: Record<MachineImageKey, typeof Factory> = {
  lineOverview: Factory,
  raw: Package,
  process: Cog,
  quality: ScanLine,
  photoPlaceholder: Factory,
};

export function SectionFallback({
  title,
  subtitle,
  imageKey = 'lineOverview',
  className,
}: {
  title: string;
  subtitle?: string;
  imageKey?: MachineImageKey;
  className?: string;
}) {
  const Icon = ICONS[imageKey];
  return (
    <div
      className={cn(
        'flex h-full min-h-[9rem] w-full flex-col items-center justify-center gap-2 bg-navy-800 px-3 py-6 text-center',
        className,
      )}
    >
      <span className="rounded-2xl bg-brand-yellow/15 p-3 text-brand-yellow">
        <Icon size={28} aria-hidden />
      </span>
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle ? <p className="text-xs text-navy-200">{subtitle}</p> : null}
    </div>
  );
}

export function MachineImage({
  imageKey,
  alt,
  className,
  fallbackSubtitle,
}: {
  imageKey: MachineImageKey;
  alt: string;
  className?: string;
  fallbackSubtitle?: string;
}) {
  const markup = MACHINE_IMAGE_SVG[imageKey];
  if (!markup) {
    return (
      <SectionFallback title={alt} subtitle={fallbackSubtitle} imageKey={imageKey} className={className} />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('machine-schema overflow-hidden bg-navy-900 [&_svg]:h-full [&_svg]:w-full', className)}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

export function SafeImg({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <SectionFallback title={alt} className={className} />;
  }
  if (src.startsWith('<svg') || MACHINE_IMAGE_SVG[src]) {
    const markup = MACHINE_IMAGE_SVG[src] ?? src;
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('overflow-hidden [&_svg]:h-full [&_svg]:w-full', className)}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
