export default function OrientationWarning() {
  return (
    <div className="pointer-events-auto absolute inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-kimiko-bg px-10 text-center">
      <div className="text-5xl">📱</div>
      <p className="text-lg font-medium text-kimiko-fg">Lay your phone flat</p>
      <p className="text-base text-kimiko-sub">Place it face-up on a surface, then put all ten fingers on screen.</p>
    </div>
  );
}
