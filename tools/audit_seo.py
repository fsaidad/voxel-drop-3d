"""Bounded technical audit of one public page and its discovery endpoints."""
import argparse
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.language = ""
        self.description = ""
        self.canonicals = []
        self.robots = []
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.language = attrs.get("lang", "")
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = attrs.get("name", "").lower()
            if name == "description":
                self.description = attrs.get("content", "")
            elif name in ("robots", "googlebot"):
                self.robots.append(attrs.get("content", ""))
        elif tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def fetch(url):
    request = Request(url, headers={"User-Agent": "VoxelDropPortfolioAudit/1.0"})
    try:
        response = urlopen(request, timeout=20)
    except HTTPError as error:
        response = error
    with response:
        body = response.read(2_000_001)
        if len(body) > 2_000_000:
            raise ValueError("Response exceeds the audit's 2 MB limit")
        return {
            "status": response.status,
            "url": response.url,
            "content_type": response.headers.get("Content-Type", ""),
            "x_robots_tag": response.headers.get("X-Robots-Tag", ""),
            "body": body.decode("utf-8", errors="replace"),
        }


def has_self_canonical(canonicals, base):
    if len(canonicals) != 1:
        return False
    actual = urlsplit(canonicals[0])
    expected = urlsplit(base)
    return (
        actual.scheme == expected.scheme
        and actual.netloc.lower() == expected.netloc.lower()
        and (actual.path or "/") == (expected.path or "/")
        and not actual.query
        and not actual.fragment
    )


def audit(base):
    parts = urlsplit(base)
    if parts.scheme not in ("http", "https") or not parts.netloc or parts.username or parts.password:
        raise ValueError("Use a public HTTP(S) site origin without credentials")
    base = f"{parts.scheme}://{parts.netloc}/"
    home = fetch(base)
    parser = Page()
    parser.feed(home["body"])
    robots = fetch(urljoin(base, "robots.txt"))
    sitemap = fetch(urljoin(base, "sitemap.xml"))
    missing = fetch(urljoin(base, "__seo-audit-missing-page__"))
    locations = []
    if sitemap["status"] == 200:
        document = ElementTree.fromstring(sitemap["body"])
        locations = [node.text for node in document.iter() if node.tag.split("}")[-1] == "loc"]
    directives = ",".join(parser.robots + [home["x_robots_tag"]]).lower()
    checks = {
        "home_returns_200": home["status"] == 200,
        "title_in_server_html": bool(parser.title.strip()),
        "description_in_server_html": bool(parser.description.strip()),
        "html_language_declared": bool(parser.language),
        "single_self_canonical": has_self_canonical(parser.canonicals, base),
        "no_noindex_directive": "noindex" not in directives,
        "robots_returns_200_and_lists_sitemap": robots["status"] == 200 and urljoin(base, "sitemap.xml") in robots["body"],
        "sitemap_returns_200_and_lists_home": sitemap["status"] == 200 and base in locations,
        "missing_page_returns_404": missing["status"] == 404,
    }
    return {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "site": base,
        "scope": "One public page, robots.txt, sitemap.xml and one deliberately missing route. No ranking or performance claims.",
        "home": {key: value for key, value in home.items() if key != "body"},
        "page": {"title": parser.title, "description": parser.description, "html_lang": parser.language, "canonical": parser.canonicals, "robots_meta": parser.robots},
        "robots": {"status": robots["status"], "body": robots["body"] if robots["status"] == 200 else None},
        "sitemap": {"status": sitemap["status"], "urls": locations},
        "missing_page_status": missing["status"],
        "checks": checks,
        "passed": sum(checks.values()),
        "total": len(checks),
    }


if __name__ == "__main__":
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("base")
    args.add_argument("--output", required=True)
    options = args.parse_args()
    result = audit(options.base)
    destination = Path(options.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"passed": result["passed"], "total": result["total"], "checks": result["checks"]}, ensure_ascii=False, indent=2))
