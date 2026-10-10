# Nicemice Project Notes

## Tech Stack
- React + Vite + TypeScript + Tailwind CSS
- Deploy: Cloudflare Workers
- Repo: github.com/fradityam/nicemice
- Domain: nicemice.id (beli di Domainesia, Juli 2026)

## Templates
- Cherry (/template/cherry) - pink playful illustrated
- Sage (/template/sage) - modern minimalist green
- Batik (/template/batik) - traditional Javanese
- Noir (/template/noir) - luxury dark navy gold

## Couple names in templates
- Fadil & Ratu
- Orang tua Ratu: Bpk. Kayo & Ibu Dewi Sudiar
- Orang tua Fadil: Bpk. Soelistiyono & Ibu Sekar Mayangsari

## Domain & Cloudflare Status (19 Juli 2026)
- nicemice.id LIVE ✅ (https://nicemice.id)
- www.nicemice.id masih 522 error, perlu dicek
- Nameserver: clayton.ns.cloudflare.com & treasure.ns.cloudflare.com
- Workers custom domain: nicemice.id sudah connected
- SSL: otomatis dari Cloudflare (gratis)

## Known Issues
- www.nicemice.id 522 error - cek DNS CNAME www di Cloudflare
  atau tunggu propagasi lebih lama

## Next Steps
1. Fix www.nicemice.id (cek CNAME www di Cloudflare DNS)
2. Setup SEO (meta tags, sitemap, robots.txt, OG tags)
3. Setup blog dengan Sanity.io
4. Integrasi Supabase untuk platform beneran
5. Setup Google Search Console
6. Setup Google Analytics

## Later: order popup (not built yet)
When orders open, the homepage "Pesan" (catalog cards) and "Ngobrol dengan kami" (final CTA)
buttons should open an order popup instead of the current toast.
- Based on the old site's "Ajukan Kustomisasi Desain" modal: shows the chosen template
  package, asks for full name and email/WhatsApp, with a "Kirim Rincian Pesanan" button.
- Restyle it to match the new homepage design (src/components/home/home.css).
- Old modal for reference: src/components/TemplateShowcase.tsx at commit 7d09494 (removed in
  c98ad11). Note its form didn't send anything; it only showed a success message.
- Decide where submissions go BEFORE building: WhatsApp prefilled message, or Supabase.
- Until then, keep the current behaviour: while CONTACT_WHATSAPP in src/config.ts is empty,
  both buttons show the "Pemesanan segera dibuka!" toast (src/components/home/OrderLink.tsx,
  OrderNotice.tsx).