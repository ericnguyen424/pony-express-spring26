# to be deleted/reworked in the future
import json
from pathlib import Path

data_file = Path(__file__).parent.parent / "data" / "assign02_data.json"

with open(data_file) as f:
    DATA = json.load(f)

ACCOUNTS = DATA["accounts"]
CHATS = DATA["chats"]
CHAT_MEMBERSHIPS = DATA["chat_memberships"]
MESSAGES = DATA["messages"]
