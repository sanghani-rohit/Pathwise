import os
import time
import requests
from dotenv import load_dotenv
from datetime import datetime

# --------------------------------------------------
# Load ENV
# --------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not OPENAI_API_KEY:
    raise RuntimeError("❌ Missing required env variables")

# --------------------------------------------------
# Config
# --------------------------------------------------
TABLE = "learning_content"
BATCH_SIZE = 5
DELAY = 1.5  # seconds
EMBEDDING_MODEL = "text-embedding-3-small"

SUPABASE_ENDPOINT = f"{SUPABASE_URL}/rest/v1/{TABLE}"
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

OPENAI_URL = "https://api.openai.com/v1/embeddings"
OPENAI_HEADERS = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
}

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def parse_array(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    return [v.strip() for v in str(val).strip("{}").split(",") if v.strip()]

def build_embedding_text(row):
    tags = ", ".join(parse_array(row.get("tags")))
    prereq = ", ".join(parse_array(row.get("prerequisites")))

    return f"""
Skill: {row.get("skill_name")}
Module: {row.get("module_name")}
Topic: {row.get("topic_name")}
Subtopic: {row.get("subtopic_name")}

Description:
{row.get("description")}

Tags: {tags}
Prerequisites: {prereq}
Estimated Hours: {row.get("estimated_hours")}
""".strip()

# --------------------------------------------------
# OpenAI Embedding
# --------------------------------------------------
def get_embedding(text):
    payload = {
        "model": EMBEDDING_MODEL,
        "input": text
    }
    resp = requests.post(
        OPENAI_URL,
        headers=OPENAI_HEADERS,
        json=payload,
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()["data"][0]["embedding"]

# --------------------------------------------------
# Supabase
# --------------------------------------------------
def fetch_rows():
    params = {
        "select": "*",
        "embedding": "is.null",
        "limit": BATCH_SIZE
    }
    resp = requests.get(
        SUPABASE_ENDPOINT,
        headers=SUPABASE_HEADERS,
        params=params
    )
    resp.raise_for_status()
    return resp.json()

def update_embedding(row_id, embedding):
    resp = requests.patch(
        f"{SUPABASE_ENDPOINT}?id=eq.{row_id}",
        headers=SUPABASE_HEADERS,
        json={"embedding": embedding}
    )
    resp.raise_for_status()

# --------------------------------------------------
# Main
# --------------------------------------------------
def main():
    print("=" * 70)
    print("🚀 OPENAI EMBEDDING GENERATION")
    print("=" * 70)

    start = datetime.now()
    processed = 0

    while True:
        rows = fetch_rows()
        if not rows:
            print("\n🎉 All embeddings completed!")
            break

        for row in rows:
            try:
                text = build_embedding_text(row)
                embedding = get_embedding(text)
                update_embedding(row["id"], embedding)

                processed += 1
                print(f"✅ [{processed}] Embedded → {row['subtopic_name'][:60]}")

                time.sleep(DELAY)

            except Exception as e:
                print(f"❌ Failed: {e}")
                time.sleep(5)

    mins = (datetime.now() - start).total_seconds() / 60
    print(f"\n⏱ Total time: {mins:.1f} minutes")

if __name__ == "__main__":
    main()
