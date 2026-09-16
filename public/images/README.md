# Your photos go here

Two image slots, both referenced from `src/content/content.json` under
`profile.portrait` and `profile.aboutImage`. Until you add the files, the site
renders a labelled placeholder in each slot instead of a broken image — nothing
breaks, so you can deploy before the photos are ready.

| File           | Used in                       | Aspect | Suggested size |
| -------------- | ----------------------------- | ------ | -------------- |
| `portrait.jpg` | Hero card, top right          | 4:5    | 900 × 1125 px  |
| `about.jpg`    | Profile panel, right column   | 4:3    | 1200 × 900 px  |

Notes:

- **Portrait** is the face shot — head and shoulders, looking at camera. It sits
  inside a tilting 3D card with a gradient fade at the bottom, so leave a little
  headroom and don't put anything important in the lowest ~15%.
- **About** is the wider, contextual shot: you at a bench, at a desk, with
  hardware. It reads as documentary rather than posed.
- Export as JPEG at quality ~82 and keep each file under ~300 KB. They are
  served with a 30-day cache header.
- `portrait.jpg` is also the social preview image (`og:image` in `index.html`).

To use different filenames or formats (`.webp`, `.avif`), just change the paths
in `src/content/content.json` — nothing else refers to them.
