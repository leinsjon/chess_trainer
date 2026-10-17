# Daily email setup

The game runs entirely on the iPad, so it can't send email by itself. Instead it
sends its daily totals to a Google Sheet, and a small script attached to that
sheet emails you a summary every evening at 7pm.

1. Create a new Google Sheet (any name, e.g. "Piggy Chess usage").
2. In the sheet, open **Extensions > Apps Script**.
3. Delete what's in the editor, paste in everything from
   [`apps-script/Code.gs`](../apps-script/Code.gs), and click **Save**.
4. In the function menu at the top, pick **setup** and click **Run**. Google
   will ask you to allow the script to edit the sheet and send email as you;
   allow it. (You may need to click "Advanced" and "Go to project" because it's
   your own unpublished script.)
5. Click **Deploy > New deployment**, choose type **Web app**, set
   **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
6. Copy the **Web app URL** (it ends in `/exec`) and paste it into
   `js/config.js` as `REPORT_URL`, or send it to Claude to add.

To try the email right away, pick **sendDailyReport** in the function menu and
click **Run**.

The report includes minutes played, moves made, lesson levels and lessons
finished, games against the bot, and answers in the Little Piggy games, plus a
seven-day table. Usage is counted
per iPad, and only while the game is on screen and being touched.
