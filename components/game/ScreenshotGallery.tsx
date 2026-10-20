export default function ScreenshotGallery({ imageIds }: { imageIds: string[] }) {
  if (!imageIds || imageIds.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 border-t border-ink-line pt-10">
      <h2 className="font-display text-2xl text-paper">Screenshots</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {imageIds.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${id}.jpg`}
            alt=""
            className="h-44 w-auto shrink-0 rounded-xl border border-ink-line object-cover"
          />
        ))}
      </div>
    </section>
  );
}
