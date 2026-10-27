# Technical SEO: Voxel Drop

Dmitry Mikhailov · 27 October 2026 · independent portfolio project, not a client commission.

## Goal and scope

Declare the preferred URL and provide consistent crawler-discovery endpoints for the public Next.js game. The audit covers one page, robots.txt, sitemap.xml and one deliberately missing route. No NDA materials were used.

## Evidence before the change

The page returned HTTP 200 with a title, description and language in server-rendered HTML, without a noindex directive. There was no canonical link. Both discovery endpoints returned 404; the missing page correctly returned 404. [Raw baseline](seo/before.json): six of nine checklist checks passed.

For a one-page game, missing robots/sitemap files do not by themselves establish an indexing defect. This is a bounded technical setup case, not a claim of a critical SEO failure.

## Implementation and verification

- Added an absolute self-canonical through Next.js metadataBase and alternates.canonical.
- Added typed metadata routes for robots.txt and sitemap.xml.
- Included only the actual canonical page in the sitemap, without invented modification dates or language routes.
- Repeated the same public audit: [after.json](seo/after.json), nine of nine checklist checks passed.

The checker parses HTML tags, not JavaScript strings, and handles equivalent root URLs with and without a trailing slash. Three tests cover the parser and canonical validation. An initially overstrict trailing-slash check produced a false negative; it was corrected and tested before documenting the final result. The original baseline remains valid because its canonical was absent.

## Reproduce

Python 3, standard library only:

```sh
python tools/audit_seo.py https://voxel-drop-3d.vercel.app/ --output audit.json
python -m unittest discover -s tools -p test_audit_seo.py
```

## Limits

Nine of nine is this checklist's result, not an SEO score. Search Console, actual indexing, rankings, traffic, revenue and performance were not measured. Robots, sitemaps and the absence of noindex do not guarantee indexing. EN/RU interface preferences use the same URL; this is not a claim of localized URL/hreflang implementation. A large multilingual content audit would be a separate scope.

[Live game](https://voxel-drop-3d.vercel.app/) · [robots.txt](https://voxel-drop-3d.vercel.app/robots.txt) · [sitemap.xml](https://voxel-drop-3d.vercel.app/sitemap.xml) · [Russian case](SEO-CASE-RU.md)
