import Link from "next/link";

export default function ApiHome() {
  return (
    <main>
      <h1>Rinrelife API</h1>
      <p>Backend service is running.</p>
      <Link href="/api/health">Health check</Link>
    </main>
  );
}
