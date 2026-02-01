import nfc # Using nfcpy library
from supabase import create_client

# Use your Vercel Environment Variables
url = "https://gyvoltozwpuvvsmtkdew.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dm9sdG96d3B1dnZzbXRrZGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODkxMzEsImV4cCI6MjA4NTQ2NTEzMX0.SHqMu2BEKReXr7WoxPM6-R_UTNYFQZkL7GBMvDo8Sxs"
supabase = create_client(url, key)

def on_connect(tag):
    print(f"Card detected: {tag}")
    # In a real setup, you'd map the tag ID to a name in a 'users' table
    user_data = {"full_name": "Test User", "status": "Present"}
    
    # Insert into your attendance_logs table
    supabase.table("attendance_logs").insert(user_data).execute()
    print("Attendance Logged!")

with nfc.ContactlessFrontend('usb') as clf:
    clf.connect(rdwr={'on-connect': on_connect})