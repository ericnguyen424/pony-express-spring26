import { createFileRoute } from "@tanstack/react-router";
import NavBar, { type NavItem } from "../../components/navbar";

export const Route = createFileRoute("/")( {
    component: Index
});

function Index() {
    const items: NavItem[] = [
        {kind : "page", name: "Account", link: "/account"}, 
        {kind : "chat", chats: []}
    ]

    return (
        <>
        <NavBar items = {items}></NavBar>
        <div>
            <h1>Pony Express</h1>
            <p>This is a messaging application that allows you to create chats</p>
        </div>
        </>
    )
}