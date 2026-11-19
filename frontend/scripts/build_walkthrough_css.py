import re
import os

tokens_path = 'D:/datafix-motion-poc-01-visual-v2/src/styles/tokens.css'
demo_path = 'D:/datafix-motion-poc-01-visual-v2/src/styles/demo.css'
story_path = 'D:/datafix-motion-poc-01-visual-v2/src/styles/v3-story.css'
output_path = 'D:/DataFix/frontend/src/styles/walkthrough.css'

with open(tokens_path, 'r', encoding='utf-8') as f:
    tokens_raw = f.read()

with open(demo_path, 'r', encoding='utf-8') as f:
    demo_raw = f.read()

with open(story_path, 'r', encoding='utf-8') as f:
    story_raw = f.read()

# Read fonts.css content
with open('D:/DataFix/frontend/public/fonts/walkthrough/fonts.css', 'r', encoding='utf-8') as f:
    fonts_css_content = f.read()

# 1. Parse tokens
m_root = re.search(r':root\s*\{([\s\S]*?)\n\}', tokens_raw)
root_tokens = m_root.group(1) if m_root else ''

m_dark = re.search(r'\[data-theme=["\']dark["\']\]\s*\{([\s\S]*?)\n\}', tokens_raw)
dark_tokens = m_dark.group(1) if m_dark else ''

def clean_and_prefix_css(css_text, scope='.df-walkthrough'):
    # Helper to separate comments from selector
    def prefix_single_selector(sel, sc):
        sel = sel.strip()
        if not sel:
            return ""
        if sel.startswith(sc):
            return sel
        if sel in [':root', 'html', 'body']:
            return sc
        return f"{sc} {sel}"

    def process_block(block_text):
        out = []
        pos = 0
        length = len(block_text)

        while pos < length:
            # Skip whitespace
            m_ws = re.match(r'\s+', block_text[pos:])
            if m_ws:
                out.append(m_ws.group(0))
                pos += len(m_ws.group(0))
                if pos >= length:
                    break

            # Comment
            if block_text[pos:pos+2] == '/*':
                end = block_text.find('*/', pos+2)
                if end == -1:
                    out.append(block_text[pos:])
                    break
                out.append(block_text[pos:end+2])
                pos = end + 2
                continue

            # At-rule
            if block_text[pos] == '@':
                brace = block_text.find('{', pos)
                if brace == -1:
                    out.append(block_text[pos:])
                    break
                header = block_text[pos:brace].strip()
                # Find matching closing brace
                b_count = 1
                curr = brace + 1
                while curr < length and b_count > 0:
                    if block_text[curr:curr+2] == '/*':
                        c_end = block_text.find('*/', curr+2)
                        curr = length if c_end == -1 else c_end + 2
                        continue
                    if block_text[curr] == '{':
                        b_count += 1
                    elif block_text[curr] == '}':
                        b_count -= 1
                    curr += 1
                inner = block_text[brace+1:curr-1]
                if header.startswith('@media'):
                    nested = process_block(inner)
                    out.append(f"{header} {{\n{nested}\n}}")
                else:
                    out.append(f"{header} {{\n{inner}\n}}")
                pos = curr
                continue

            # Regular rule
            brace = block_text.find('{', pos)
            if brace == -1:
                out.append(block_text[pos:])
                break
            raw_sel = block_text[pos:brace]
            # separate comments within selector if any
            sel_comments = []
            cleaned_sel = raw_sel
            for cm in re.findall(r'/\*[\s\S]*?\*/', raw_sel):
                sel_comments.append(cm)
                cleaned_sel = cleaned_sel.replace(cm, '')

            # Find matching closing brace
            b_count = 1
            curr = brace + 1
            while curr < length and b_count > 0:
                if block_text[curr:curr+2] == '/*':
                    c_end = block_text.find('*/', curr+2)
                    curr = length if c_end == -1 else c_end + 2
                    continue
                if block_text[curr] == '{':
                    b_count += 1
                elif block_text[curr] == '}':
                    b_count -= 1
                curr += 1
            body = block_text[brace+1:curr-1]

            # Output any comments that were before or inside selector
            for cm in sel_comments:
                out.append(f"{cm}\n")

            selectors = [s.strip() for s in cleaned_sel.split(',') if s.strip()]
            prefixed = [prefix_single_selector(s, scope) for s in selectors]
            if prefixed:
                out.append(f"{', '.join(prefixed)} {{\n{body}\n}}")
            pos = curr

        return "".join(out)

    return process_block(css_text)

prefixed_demo = clean_and_prefix_css(demo_raw, '.df-walkthrough')
prefixed_story = clean_and_prefix_css(story_raw, '.df-walkthrough')

walkthrough_css = f"""/* ==========================================================================
   DataFix Walkthrough — Scoped Cinematic Stylesheet
   Encapsulated strictly under `.df-walkthrough`
   ========================================================================== */

/* Self-Hosted Isolated Fonts (Manrope, Petrona, JetBrains Mono) */
{fonts_css_content}

/* 1. Design Tokens Scoped to .df-walkthrough */
.df-walkthrough {{
{root_tokens}
}}

/* Dark Mode Tokens Scoped to .df-walkthrough[data-theme="dark"] */
.df-walkthrough[data-theme="dark"] {{
{dark_tokens}
}}

/* 2. Walkthrough Container Foundation */
.df-walkthrough {{
  font-family: var(--df-font-body, 'Manrope', system-ui, sans-serif);
  background: var(--df-canvas);
  color: var(--df-text-body);
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}}

.df-walkthrough *,
.df-walkthrough *::before,
.df-walkthrough *::after {{
  box-sizing: border-box;
}}

.df-walkthrough button {{
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}}

.df-walkthrough button:focus-visible,
.df-walkthrough [tabindex]:focus-visible {{
  outline: 2px solid var(--df-focus-ring);
  outline-offset: 2px;
}}

.df-walkthrough .df-sr-only {{
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}}

/* 3. Scoped Hero & Editorial Component Styles (demo.css) */
{prefixed_demo}

/* 4. Scoped 8-Stage Story Styles (v3-story.css) */
{prefixed_story}
"""

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(walkthrough_css)

print(f"Generated complete clean {output_path} successfully ({len(walkthrough_css)} bytes).")
