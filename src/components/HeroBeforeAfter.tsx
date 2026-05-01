"use client";

import { useEffect, useState } from "react";

const RETRO_DEMO = `<!DOCTYPE html>
<html><head><title>Yahoo!</title></head>
<body bgcolor="#FFFFFF" text="#000000" link="#0000EE" vlink="#551A8B">
<table align="center" width="780" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center">
<font face="Times New Roman" size="7" color="#7B0099"><b>Yahoo!</b></font>
<br><font size="2">The most visited site on the web</font>
<br><br>
<form><input type="text" size="40"> <input type="submit" value="Search"></form>
<table border="1" cellpadding="6"><tr>
<td><b>Arts</b><br><font size="1">Movies, Music, TV</font></td>
<td><b>News</b><br><font size="1">World, Local, Sports</font></td>
<td><b>Shopping</b><br><font size="1">Auctions, Stores</font></td>
</tr></table>
<br><marquee><font color="#FF0000">★ NEW! Yahoo! Mail — get yours free! ★</font></marquee>
</td></tr></table></body></html>`;

const MODERN_DEMO = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,system-ui,sans-serif;color:#0a0a0a;background:#fafafa;line-height:1.5}
  header{padding:48px 24px;text-align:center}
  h1{font-size:48px;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(90deg,#7B0099,#ec4899);-webkit-background-clip:text;color:transparent}
  p.tag{color:#71717a;margin-top:8px;font-size:14px}
  .search{max-width:520px;margin:24px auto 0;display:flex;gap:8px}
  input{flex:1;padding:14px 18px;border-radius:999px;border:1px solid #e4e4e7;font-size:15px;background:#fff}
  button{padding:14px 22px;border-radius:999px;border:0;background:#0a0a0a;color:#fff;font-weight:600;cursor:pointer}
  .grid{max-width:960px;margin:48px auto;padding:0 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .card{padding:24px;background:#fff;border:1px solid #e4e4e7;border-radius:16px;transition:border-color .2s}
  .card:hover{border-color:#0a0a0a}
  .card h3{font-size:16px;margin-bottom:6px}
  .card p{font-size:13px;color:#71717a}
</style></head>
<body>
<header>
<h1>Yahoo!</h1>
<p class="tag">The most visited site on the web</p>
<div class="search"><input placeholder="Search the web"><button>Search</button></div>
</header>
<section class="grid">
<div class="card"><h3>Arts</h3><p>Movies, Music, TV</p></div>
<div class="card"><h3>News</h3><p>World, Local, Sports</p></div>
<div class="card"><h3>Shopping</h3><p>Auctions, Stores</p></div>
</section>
</body></html>`;

export function HeroBeforeAfter() {
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setShowAfter((v) => !v), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border)] bg-black">
      <iframe
        srcDoc={RETRO_DEMO}
        sandbox="allow-same-origin"
        className="absolute inset-0 w-full h-full transition-opacity duration-700"
        style={{ opacity: showAfter ? 0 : 1 }}
        title="retro demo"
      />
      <iframe
        srcDoc={MODERN_DEMO}
        sandbox="allow-same-origin"
        className="absolute inset-0 w-full h-full transition-opacity duration-700"
        style={{ opacity: showAfter ? 1 : 0 }}
        title="modern demo"
      />
      <div className="absolute bottom-3 left-3 text-xs font-mono px-2 py-1 rounded bg-black/70 text-white">
        {showAfter ? "hoje" : "anos 2000"}
      </div>
    </div>
  );
}
