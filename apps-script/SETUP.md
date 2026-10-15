# RSVP & ucapan: Google Sheets setup

One central Google Apps Script receives every couple's RSVPs and saves each couple's guests in
that couple's own Google Sheet. The website sends to it and reads the wishes back from it.

Do all of this while signed in to the **nicemice Google account**.

Only `rsvp.gs` gets pasted into Google. `appsscript.json` just records the settings chosen in
the steps below (Jakarta time, runs as you, open to the website).

## One-time setup (about 15 minutes)

### 1. Make the control spreadsheet

1. Go to [sheets.new](https://sheets.new). Name it **nicemice RSVP – Pusat**.
2. Don't share this spreadsheet with anyone. It lists every couple.

### 2. Add the script

1. In that spreadsheet: **Extensions → Apps Script**.
2. Name the project (top left) **nicemice RSVP**.
3. Delete everything in `Code.gs`, then paste in the whole of [`rsvp.gs`](rsvp.gs). Save (Ctrl+S).
4. Click **Project Settings** (the gear on the left) and set **Time zone** to
   *(GMT+07:00) Jakarta*.

### 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Next to "Select type", click the gear and choose **Web app**.
3. Fill in:
   - Description: `RSVP`
   - Execute as: **Me (the nicemice account)**
   - Who has access: **Anyone**
4. Click **Deploy**, then **Authorize access**, and choose the nicemice account.
   Google warns that the app "isn't verified" because it's your own script: click
   **Advanced → Go to nicemice RSVP (unsafe)** → **Allow**.
5. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy…/exec`.
6. Send that URL to the developer. It goes into `RSVP_ENDPOINT` in `src/config.ts`.

"Anyone" only means the website can send RSVPs to the script without a Google login. Nobody
can open the spreadsheets through it. The script only ever returns a couple's names and
wishes, never their attendance list.

### 4. Check it

1. Reload the control spreadsheet. A **nicemice** menu appears (it can take a few seconds).
2. Use **nicemice → Pasangan baru…** with slug `tes` and your own email. This creates
   the **Pasangan** tab, a spreadsheet "RSVP – tes" in the Drive folder **nicemice RSVP**, and
   shares it with you.
   The first time, Google asks for permission again (to create and share files): allow it.
3. Open `<Web app URL>?slug=tes` in a browser. You should see
   `{"ok":true,"wishes":[]}`.
4. When you're done testing, delete the `tes` row from **Pasangan** and the "RSVP – tes" file.

## For each new order (about 2 minutes)

1. Open **nicemice RSVP – Pusat** → **nicemice → Pasangan baru…**
2. Enter the slug, exactly the couple's file name: `radit-ratu` for
   `src/couples/radit-ratu.ts` and `nicemice.id/radit-ratu`.
3. Enter the couple's Google (Gmail) addresses, separated by commas.
4. Done: their spreadsheet is created, shared with them as **Viewer** (Google emails them the
   link), and switched on.

To share with someone later, open their "RSVP – …" spreadsheet → **Share** → add them as
**Viewer**, and never give the general link access.

## What the couple sees

- **RSVP** tab: one row per reply, with *Time, Name, Attendance (Hadir / Tidak hadir /
  Belum pasti), Message*. New replies appear within seconds.
- **Ringkasan** tab: how many are coming, not coming and not sure yet.
- To download as Excel: **File → Download → Microsoft Excel (.xlsx)**.

## Everyday jobs

- **Hide a rude or spam wish**: in the couple's spreadsheet, tick **Hide** on that row. It
  disappears from the invitation within a minute and stops counting in **Ringkasan**.
  (Only you can do this: the couple can only view.)
- **Pause a couple's RSVPs** (e.g. months after the wedding): untick **Active** in
  **Pasangan**. The form on their invitation then says RSVPs are closed.
- **Delete guest data** when you agreed to (e.g. 3 months after the wedding): delete the
  couple's "RSVP – …" file and their row in **Pasangan**.

## When the script changes

Paste the new `rsvp.gs` over the old one, save, then **Deploy → Manage deployments** →
the pencil icon → **Version: New version** → **Deploy**. The URL stays the same.

**Never use "New deployment" again.** It creates a new URL, and every invitation keeps
sending to the old one.

## Limits worth knowing

- Saving a reply takes 1–3 seconds (Google's speed, not the site's).
- Per couple, more than 60 replies within 10 minutes are refused as a flood. Real guests
  never get near that.
- The same reply sent twice within 10 minutes (a double tap) is saved once.
- Names are cut at 60 characters and messages at 500.
