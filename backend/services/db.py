from flask import g
from core.supabase_client import get_supabase_client

def get_db():
    if 'db' not in g:
        g.db = get_supabase_client()
    return g.db

def init_db(app):
    # Supabase client is stateless/http-based, so strictly speaking
    # we don't need a heavy init, but we check env vars here.
    pass
