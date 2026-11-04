import { BookOpen, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#00022E] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 font-serif text-2xl font-bold"><BookOpen size={24} className="text-[#C87958]" />BookNook</Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75">A friendly online library for curious readers. Discover a new favorite, share a well-loved book, and make room for a good story.</p>
        </div>
        <div>
          <h2 className="font-bold">Get in touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex items-center gap-2"><Mail size={16} /><a href="mailto:hello@booknook.example" className="hover:text-white">hello@booknook.example</a></li>
            <li className="flex items-center gap-2"><Phone size={16} /><a href="tel:+15550140142" className="hover:text-white">+1 (555) 014-0142</a></li>
            <li className="flex items-center gap-2"><MapPin size={16} />Your neighborhood, online</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold">Stay connected</h2>
          <div className="mt-4 flex gap-3">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="btn btn-circle btn-sm border-white/25 bg-white/5 text-white hover:bg-white/15"><Globe size={17} /></a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="btn btn-circle btn-sm border-white/25 bg-white/5 text-white hover:bg-white/15"><MessageCircle size={17} /></a>
            <a href="mailto:hello@booknook.example" aria-label="Email BookNook" className="btn btn-circle btn-sm border-white/25 bg-white/5 text-white hover:bg-white/15"><Mail size={17} /></a>
          </div>
          <nav className="mt-5 flex gap-4 text-sm text-white/75"><Link href="/books" className="hover:text-white">Browse books</Link><Link href="/register" className="hover:text-white">Join us</Link></nav>
        </div>
      </div>
      <div className="border-t border-white/15 px-6 py-4 text-center text-xs text-white/60">© {new Date().getFullYear()} BookNook. Read, share, return.</div>
    </footer>
  );
}
