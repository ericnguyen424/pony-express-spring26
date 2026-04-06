type NavItem = 
    | {kind : "page"; name: string; link: string}
    | {kind : "chat-group"; chats: { name: string; link: string}[]}

export default function NavBar(items : NavItem[]) {
    return (
        <>
        <header>
            <h2>
                <a href="/">Pony Express</a>
            </h2>
        </header>
        <body>
            <ul>
                {items.map((item) => renderNavItem(item))}
            </ul>
        </body>
        </>
    )
}

function renderNavItem(item: NavItem){
    switch (item.kind) {
        case "page":
            return (
                <li key={item.link}><a href= {item.link}>{item.name}</a></li>
            )
        
        case "chat-group":
            return (
                <li key = "Chat">Chat
                    <ul>
                       {item.chats.map((chat) => (
                        <li key={chat.link}><a href={chat.link}>{chat.name}</a></li>
                       ))}
                    </ul>
                </li>
            )
    }
}

