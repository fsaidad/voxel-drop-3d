import unittest
from audit_seo import Page, has_self_canonical


class AuditChecks(unittest.TestCase):
    def test_root_url_equivalence(self):
        self.assertTrue(has_self_canonical(["https://example.test"], "https://example.test/"))
        self.assertTrue(has_self_canonical(["https://example.test/"], "https://example.test/"))

    def test_canonical_must_be_single_absolute_and_self_referencing(self):
        for value in ([], ["/"], ["https://other.test/"], ["https://example.test/a"],
                      ["https://example.test/?q=1"], ["https://example.test/#x"],
                      ["https://example.test/", "https://example.test/"]):
            with self.subTest(value=value):
                self.assertFalse(has_self_canonical(value, "https://example.test/"))

    def test_metadata_is_read_from_tags_not_script_strings(self):
        page = Page()
        page.feed('''<html lang="en"><head><title>Voxel &amp; blocks</title>
        <script>const fake = '<link rel="canonical" href="https://fake.test/">';</script>
        <meta name="description" content="A puzzle"><link rel="canonical" href="https://example.test/"></head>''')
        self.assertEqual(page.title, "Voxel & blocks")
        self.assertEqual(page.language, "en")
        self.assertEqual(page.description, "A puzzle")
        self.assertEqual(page.canonicals, ["https://example.test/"])


if __name__ == "__main__":
    unittest.main()
