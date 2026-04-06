import { useLocation, Link } from "@tanstack/react-router";
import { useState, type Dispatch, type SetStateAction } from "react";

export type NavItem = 
    | {kind : "page"; name: string; link: string; active?: boolean}
    | {kind : "chat"; name: string; link: string; active?: boolean; chats: { name: string; link: string; active?: boolean}[]}

export default function NavBar({items} : { items: NavItem[]}) {
    const [showChats, setShowChats] = useState(false);
    const location = useLocation();
    const isChatsRoute = location.pathname.startsWith("/chats") || location.pathname.startsWith("/chat");
    const chatsOpen = showChats || isChatsRoute;

    return (
        <aside className="w-64 shrink-0 min-h-screen border-r bg-white p-4">
            <header className="mb-6">
                <h2 className="text-2xl font-bold">
                    <a href="/">Pony Express</a>
                </h2>
            </header>

            <ul className="space-y-2">
                {items.map((item) => renderNavItem(item, chatsOpen, setShowChats))}
            </ul>
        </aside>
    )
}

function renderNavItem(
    item: NavItem,
    chatsOpen: boolean,
    setShowChats: Dispatch<SetStateAction<boolean>>,
){
    switch (item.kind) {
        case "page":
            return (
                <li key={item.link}>
                    <Link
                        to={item.link}
                        aria-current={item.active ? "page" : undefined}
                        className={[
                            "block rounded-md px-3 py-2 border",
                            item.active
                                ? "border-blue-300 bg-blue-50 text-blue-800 font-semibold"
                                : "border-transparent hover:bg-gray-100",
                        ].join(" ")}
                    >
                        {item.name}
                    </Link>
                </li>
            )
        
        case "chat":
            return (
                <li key={item.link} className="mt-4">
                    <Link
                        to={item.link}
                        onClick={() => setShowChats(true)}
                        aria-current={item.active ? "page" : undefined}
                        className={[
                            "block w-full rounded-md px-3 py-2 text-left font-semibold",
                            item.active ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-100",
                        ].join(" ")}
                    >
                        {item.name}
                    </Link>
                    {chatsOpen ? (
                        <div>
                            <p className="px-3 pb-1 pt-2 text-sm font-semibold text-gray-600">all chats</p>
                            <ul className="ml-4 space-y-1 border-l border-gray-200 pl-3">
                               {item.chats.map((chat) => (
                                <li key={chat.link}>
                                    <Link
                                        to={chat.link}
                                        aria-current={chat.active ? "page" : undefined}
                                        className={[
                                            "block rounded-md px-3 py-2 border text-sm",
                                            chat.active
                                                ? "border-blue-300 bg-blue-50 text-blue-800 font-semibold"
                                                : "border-transparent hover:bg-gray-100",
                                        ].join(" ")}
                                    >
                                        {chat.name}
                                    </Link>
                                </li>
                               ))}
                            </ul>
                        </div>
                    ) : null}
                </li>
            )
    }
}

