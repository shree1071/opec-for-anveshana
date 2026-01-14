import os
from supabase import create_client, Client
from flask import g

def get_db():
    if 'db' not in g:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("Supabase URL and Key must be set in .env")
        g.db = create_client(url, key)
    return g.db

def init_db(app):
    # Supabase client is stateless/http-based, so strictly speaking
    # we don't need a heavy init, but we check env vars here.
    pass
