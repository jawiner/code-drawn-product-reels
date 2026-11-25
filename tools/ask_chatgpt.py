"""Send a script brief to ChatGPT (OpenAI Responses API) and save its answer: a second writer for the script.

The LeadFlow film's script started this way: docs/leadflow/brief-for-chatgpt.md went out, chatgpt-script.md came
back, Claude reviewed it against the owner's rules (script-v1.md), and the owner approved a later version word for word.

    python tools/ask_chatgpt.py --check                         # is OPENAI_API_KEY set? (no API call)
    python tools/ask_chatgpt.py <brief.md> <answer.md> [model] [effort]

Needs OPENAI_API_KEY in this repo's .env (or the environment). Every call is billed to that key: the LeadFlow brief
took about 2 minutes at high effort. The key is never printed.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = "https://api.openai.com/v1/responses"
MODEL = "gpt-6.2-astra"  # the model the LeadFlow brief was sent to (2026-11); pass another as the 3rd argument


def api_key() -> str:
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / ".env")
    except ImportError:
        pass
    return (os.getenv("OPENAI_API_KEY") or "").strip()


def main():
    if sys.argv[1:] == ["--check"]:
        print("OPENAI_API_KEY is set." if api_key() else "OPENAI_API_KEY is NOT set (put it in this repo's .env).")
        return
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    brief, out = Path(sys.argv[1]), Path(sys.argv[2])
    model = sys.argv[3] if len(sys.argv) > 3 else MODEL
    effort = sys.argv[4] if len(sys.argv) > 4 else "high"
    key = api_key()
    if not key:
        sys.exit("OPENAI_API_KEY is not set (put it in this repo's .env)")
    body = {"model": model, "input": [{"role": "user", "content": brief.read_text(encoding="utf-8")}],
            "reasoning": {"effort": effort}, "max_output_tokens": 40000}
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            res = json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        try:
            err = json.loads(detail).get("error") or {}
            detail = err.get("message", detail) if isinstance(err, dict) else str(err)
        except ValueError:
            pass
        sys.exit(f"OpenAI said HTTP {e.code}: {detail[:400]}")
    text = "".join(p.get("text", "") for it in res.get("output") or [] if it.get("type") == "message"
                   for p in it.get("content") or [] if p.get("type") == "output_text")
    if not text:
        sys.exit(f"no answer (status {res.get('status')})")
    secs = round(time.time() - t0)
    u = res.get("usage") or {}
    out.write_text(f"<!-- {model}, effort {effort}, {secs} s -->\n\n{text}\n", encoding="utf-8")
    print(f"saved {out} · {model} · {secs} s · {u.get('input_tokens')} tokens in / {u.get('output_tokens')} out")


if __name__ == "__main__":
    main()
