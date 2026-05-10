import os
import re

files = [
    "src/routes/docs/+page.md",
    "src/routes/docs/quickstart/+page.md",
    "src/routes/docs/authentication/+page.md",
    "src/routes/docs/api-reference/send-message/+page.md",
    "src/routes/docs/api-reference/management/+page.md",
    "src/routes/docs/api-reference/status-codes/+page.md",
    "src/routes/docs/webhooks/+page.md",
    "src/routes/docs/errors/+page.md",
    "src/routes/docs/architecture/+page.md",
    "src/routes/docs/security/+page.md",
    "src/routes/docs/rate-limits/+page.md",
    "src/routes/docs/internal-auth/+page.md",
    "src/routes/docs/lifecycle/+page.md",
    "src/routes/docs/sdks/+page.md",
    "src/routes/docs/guides/+page.md"
]

imports = """
<script>
  import { ApiEndpoint, Callout, CodeGroup, SchemaTable } from '$docs';
  import { DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl } from '$docs/MDX';
</script>
"""

# If the file already has a script tag, we'll try to merge or replace it.
# Actually, for simplicity and explicitness, we'll just ensure these imports are there.

for f in files:
    path = os.path.join("/home/rakshitbhai/bhejna-frontend", f)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r') as file:
        content = file.read()
        
    # Find existing script tag
    script_match = re.search(r'<script>(.*?)</script>', content, flags=re.DOTALL)
    
    if script_match:
        existing_script = script_match.group(1)
        # Add imports to existing script if not present
        if '$docs' not in existing_script:
            new_script = f"<script>{existing_script}\n  import {{ ApiEndpoint, Callout, CodeGroup, SchemaTable }} from '$docs';\n  import {{ DocsH1, DocsH2, DocsH3, DocsPre, DocsTable, DocsBlockquote, DocsUl, DocsOl }} from '$docs/MDX';\n</script>"
            content = content.replace(script_match.group(0), new_script)
    else:
        # No script tag, inject new one after frontmatter
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                content = f"---{parts[1]}---{imports}{parts[2]}"
            else:
                content = imports + content
        else:
            content = imports + content
            
    with open(path, 'w') as file:
        file.write(content)

