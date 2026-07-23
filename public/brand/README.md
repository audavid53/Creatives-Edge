# Brand assets — drop your real files here

The app ships with **placeholder** blue + yellow artwork so nothing looks broken.
To use your real logo, app icon, and photos, replace the files below **using the
exact same filenames**. No code changes are needed — everything is already wired.

> Note: files on your local computer (e.g. `C:\Users\...`) can't be reached by the
> cloud build. Commit the files into this folder in the repo, or upload them
> through your editor, so they ship with the app.

## Logo & icon

| Filename                     | Used for                                   | Recommended format          |
|------------------------------|--------------------------------------------|-----------------------------|
| `favicon.svg`                | Browser tab / SEO icon                     | SVG (square, ~48×48 canvas) |
| `logo-icon.svg`              | Just the logo mark (no text)               | SVG or transparent PNG      |
| `logo-wordmark-light.svg`    | Logo + "The Creative Academy" on **light** | SVG or transparent PNG      |
| `logo-wordmark-dark.svg`     | Logo + "The Creative Academy" on **dark**  | SVG or transparent PNG      |
| `app-icon-512.png`           | PWA / high-res app icon (optional)         | 512×512 PNG                 |
| `apple-touch-icon.png`       | iOS home-screen icon (optional)            | 180×180 PNG                 |

If you provide a raster logo (PNG), you can point the in-app mark at it by editing
`src/components/BrandLogo.tsx` to render `<img src="/brand/logo-icon.svg" />`.

## Photos (marketing landing page)

| Filename                     | Used for                                   |
|------------------------------|--------------------------------------------|
| `convener.jpg`               | The convener / founder portrait            |
| `mentor-1.jpg` … `mentor-3.jpg` | Innovative mentor headshots             |
| `student-project-1.jpg` … `student-project-4.jpg` | Student project images  |

Any missing photo falls back to a styled placeholder automatically.
