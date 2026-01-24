# to be deleted/reworked in the future 
import json

with open("data/assign02_data.json") as f:
    DATA = json.load(f)

ACCOUNTS = DATA["authors"]
CHATS = DATA["chats"]
CHAT_MEMBERSHIPS = DATA["chat_memberships"]
MESSAGES = DATA["messages"]


