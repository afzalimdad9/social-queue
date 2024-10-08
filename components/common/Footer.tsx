import { StarIcon } from "@heroicons/react/24/outline";
import { kv } from "@vercel/kv";

const navigation = {
  main: [
    { name: "Terms Of Service", href: "/terms-of-service" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ],
};

export default async function Footer() {
  const starCount = (await kv.get("github-star-count")) as number;
  return (
    <footer>
      <div className="mx-auto max-w-7xl overflow-hidden px-6 pb-8 my-8">
        <nav
          className="flex justify-center items-center gap-4"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <a
                href={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-400"
              >
                {item.name}
              </a>
            </div>
          ))}
          <div className="flex items-center pb-6">
            <a
              href={`https://github.com/afzalimdad9/social-queue`}
              className="text-sm leading-6 flex items-center bg-secondaryBackground-light dark:bg-secondaryBackground-dark rounded-tl-lg rounded-bl-lg p-2"
            >
              <StarIcon className="w-4 h-4" /> Us On Github
            </a>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} YK Labs, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
