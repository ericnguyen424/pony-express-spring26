export type NavItem = 
    | {kind : "page"; name: string; link: string; active?: boolean}
    | {kind : "chat"; chats: { name: string; link: string; active?: boolean}[]}

export default function NavBar({items} : { items: NavItem[]}) {
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
                <li key={item.link}>
                    <a href={item.link} aria-current={item.active ? "page" : undefined}>
                        {item.name}
                    </a>
                    {item.active ? <span> (current)</span> : null}
                </li>
            )
        
        case "chat":
            return (
                <li key = "Chat">Chat
                    <ul>
                       {item.chats.map((chat) => (
                        <li key={chat.link}>
                            <a href={chat.link} aria-current={chat.active ? "page" : undefined}>
                                {chat.name}
                            </a>
                            {chat.active ? <span> (current)</span> : null}
                        </li>
                       ))}
                    </ul>
                </li>
            )
    }
}

