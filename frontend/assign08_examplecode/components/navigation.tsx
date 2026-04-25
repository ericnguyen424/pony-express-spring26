import { Link } from "@tanstack/react-router";

const navClass = [
  "flex flex-col",
  "px-2 pt-2 space-y-2",
].join(" ");

const subNavClass = [
  "flex flex-col",
  "px-2 pt-2 space-y-1",
].join(" ");

const linkClass = [
  "px-4 py-2",
  "border-2",
].join(" ");

const subLinkClass = [
  "px-2 py-1",
  "border-2",
].join(" ");

const activeProps = {
  className: [
    "font-bold",
    "bg-violet-200",
    "border-violet-800",
  ].join(" "),
};

const inactiveProps = {
  className: [
    "bg-violet-100",
    "border-violet-500",
    "hover:bg-violet-300",
    "hover:border-violet-700",
  ].join(" "),
};

export function OuterNav() {
  return (
    <nav className={navClass}>
      <Link
        to="/authors"
        className={linkClass}
        activeProps={activeProps}
        inactiveProps={inactiveProps}
      >
        authors
      </Link>
      <Link
        to="/books"
        className={linkClass}
        activeProps={activeProps}
        inactiveProps={inactiveProps}
      >
        books
      </Link>
    </nav>
  );
}

export function AuthorNav(
  { authors }: { authors: { id: number; name: string }[] },
) {
  return (
    <nav className={subNavClass}>
      {authors.map((author) => (
        <Link
          to="/authors/$authorId"
          key={author.id}
          params={{ authorId: author.id }}
          className={subLinkClass}
          activeProps={activeProps}
          inactiveProps={inactiveProps}
        >
          {author.name}
        </Link>
      ))}
    </nav>
  );
}

export function BookNav({ books }: { books: { id: number; title: string }[] }) {
  return (
    <nav className={subNavClass}>
      {books.map((book) => (
        <Link
          to="/books/$bookId"
          key={book.id}
          params={{ bookId: book.id }}
          className={subLinkClass}
          activeProps={activeProps}
          inactiveProps={inactiveProps}
        >
          {book.title}
        </Link>
      ))}
    </nav>
  );
}
