export type NavItem = 
    | {kind : "page"; name: string; link: string; active?: boolean}
    | {kind : "chat"; chats: { name: string; link: string; active?: boolean}[]}

export default function NavBar({items} : { items: NavItem[]}) {
    return (
        <aside className="w-64 shrink-0 min-h-screen border-r bg-white p-4">
            <header className="mb-6">
                <h2 className="text-2xl font-bold">
                    <a href="/">Pony Express</a>
                </h2>
            </header>

            <ul className="space-y-2">
                {items.map((item) => renderNavItem(item))}
            </ul>
        </aside>
    )
}

function renderNavItem(item: NavItem){
    switch (item.kind) {
        case "page":
            return (
                <li key={item.link}>
                    <a
                        href={item.link}
                        aria-current={item.active ? "page" : undefined}
                        className={[
                            "block rounded-md px-3 py-2 border",
                            item.active
                                ? "border-blue-300 bg-blue-50 text-blue-800 font-semibold"
                                : "border-transparent hover:bg-gray-100",
                        ].join(" ")}
                    >
                        {item.name}
                    </a>
                </li>
            )
        
        case "chat":
            return (
                <li key = "Chat" className="mt-4">
                    <p className="px-3 pb-1 text-sm font-semibold text-gray-600">Chats</p>
                    <ul className="space-y-1">
                       {item.chats.map((chat) => (
                        <li key={chat.link}>
                            <a
                                href={chat.link}
                                aria-current={chat.active ? "page" : undefined}
                                className={[
                                    "block rounded-md px-3 py-2 border",
                                    chat.active
                                        ? "border-blue-300 bg-blue-50 text-blue-800 font-semibold"
                                        : "border-transparent hover:bg-gray-100",
                                ].join(" ")}
                            >
                                {chat.name}
                            </a>
                        </li>
                       ))}
                    </ul>
                </li>
            )
    }
}

