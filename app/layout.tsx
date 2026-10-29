import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Huna for Huna — Find your place in Nairobi',description:'Explore residential homes across Nairobi. Find your neighbourhood, discover your next home, and connect with your Huna for Huna property team.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
