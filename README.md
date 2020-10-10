# Telegram Hackchat Bot

A splitroom bot for telegram, powered by Hack.chat.  
Use [This link](https://t.me/Splitroom_bot) to add the bot. 

## Quick Start
1. Invite the bot to a group
2. Use `/new` to create a new room. This will give you a link to a hack.chat room.
3. Join the room and chat!

Notice: 
- Whatever you send inside that room will be forwarded to the group
- Messages replies the forwarded message in telegram will also be reposted into the chat room

## Commands
#### **`/help`**
Show help text  

#### **`/new :name`**
Start a new room session. `name` is _Optional_. If no `name` is presenting, a random name looks like `sticky_car` will be generated  
&emsp;Alias: `/split` `/newSession`
    
#### **`/ls`**
List all rooms  
&emsp;Alias: `/list` `/all` `/rooms`
    
#### **`/del :roomName`**
Deactivate a room. Use `/ls` to see all room names.  
&emsp;Alias: `/revoke` `/deactivate`
    
You can reply to a reposted message. The bot will repost it to the room.`