import "./globals.css";

export const metadata = {
  title: "Sirah Digital | Intelligent Business Automation Systems",
  description: "Automate, simplify, and scale through custom software.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#08080a] antialiased m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}