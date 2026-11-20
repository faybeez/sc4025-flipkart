export function ImageSlot({ src, className }: { src?: string; className: string }) {
  return <span aria-hidden="true" className={`image-slot ${className}`} style={src ? { backgroundImage: `url("${src}")`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" } : undefined} />;
}
