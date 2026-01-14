import sys
print("Starting gemini import check...", file=sys.stderr)
try:
    import google.generativeai
    print("Successfully imported google.generativeai", file=sys.stderr)
except ImportError as e:
    print(f"ImportError: {e}", file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
print("Finished check", file=sys.stderr)
