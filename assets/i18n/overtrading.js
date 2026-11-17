(function () {
  const ser = html => { const e = document.createElement("div"); e.innerHTML = html; return e.innerHTML.replace(/\s+/g, " ").trim(); };
  const H = {
    "9:15 AM. Manideep has a plan: <i>max 2 trades</i>, <i>target ₹5,000</i>, <i>max loss ₹2,000</i>.": "सुबह 9:15। मणिदीप का प्लान तय है: <i>अधिकतम 2 ट्रेड</i>, <i>टारगेट ₹5,000</i>, <i>अधिकतम नुकसान ₹2,000</i>।",
    "The plan works. Two clean setups, two winners. <i>+₹6,200</i> by 10:30.": "प्लान काम करता है। दो साफ़ सेटअप, दोनों में जीत। 10:30 तक <i>+₹6,200</i>।",
    "10:30 AM. Target hit. Now comes the hardest part of trading…": "सुबह 10:30। टारगेट पूरा। अब आता है ट्रेडिंग का सबसे मुश्किल हिस्सा…",
    "\"I'm on fire today!\" A third trade: <i>no setup, double the size</i>. A small win makes it feel right.": "\"आज तो मैं छा गया!\" तीसरा ट्रेड: <i>कोई सेटअप नहीं, दोगुना साइज़</i>। छोटी-सी जीत इसे सही महसूस कराती है।",
    "The market turns choppy. Two losses. He <i>doubles the size again</i> to win it back.": "बाज़ार उलझ जाता है। दो नुकसान। वापस जीतने के लिए वह <i>फिर से साइज़ दोगुना करता है</i>।",
    "Revenge trades. He <i>moves the stop-loss</i> and averages a loser. \"It has to come back…\"": "बदले के ट्रेड। वह <i>स्टॉप-लॉस खिसकाता है</i> और हारे ट्रेड में एवरेज करता है। \"इसे वापस आना ही होगा…\"",
    "One big bet to recover it all… it fails. <i>Up ₹6,200 at 10:30. Down ₹5,400 at the close.</i>": "सब वापस पाने के लिए एक बड़ा दाँव… वह भी फ़ेल। <i>10:30 पर ₹6,200 मुनाफ़ा। बंद होते-होते ₹5,400 नुकसान।</i>",
    "He closes the terminal. <i>When the plan is done, the day is done.</i>": "वह टर्मिनल बंद कर देता है। <i>जब प्लान पूरा, तो दिन पूरा।</i>",
    "He gets up and goes out. A walk, fresh air, a cup of chai.": "वह उठता है और बाहर चला जाता है। टहलना, ताज़ी हवा, एक कप चाय।",
    "3:30 PM. The market closed. Many gave their profits back. <i>He kept his +₹6,200</i>, and a calm mind for tomorrow.": "दोपहर 3:30। बाज़ार बंद। कई लोगों ने अपना मुनाफ़ा लौटा दिया। <i>उसने अपने +₹6,200 बचा लिए</i>, और कल के लिए शांत मन भी।",
    "<b>🎬 The 10:30 Decision</b><span>a 3D story about overtrading</span>": "<b>🎬 10:30 का फ़ैसला</b><span>ओवरट्रेडिंग पर एक 3D कहानी</span>",
    "<a href=\"../trader-room/\">🖥️ Trading room</a><a href=\"../\">← Home</a>": "<a href=\"../trader-room/\">🖥️ ट्रेडिंग रूम</a><a href=\"../\">← होम</a>",
    "Up <em>₹6,200</em> by 10:30…<br>then what?": "10:30 तक <em>₹6,200</em> का मुनाफ़ा…<br>फिर क्या?",
    "A 2-minute 3D story. At 10:30, <b>you</b> decide what Manideep does next.": "2 मिनट की 3D कहानी। 10:30 पर <b>आप</b> तय करेंगे कि मणिदीप आगे क्या करे।",
    "😎 Keep trading<small>\"I'm on fire today!\"</small>": "😎 ट्रेड करते रहें<small>\"आज तो मैं छा गया!\"</small>", "🌳 Log off &amp; go out<small>\"Plan done. Day done.\"</small>": "🌳 ऐप बंद करें और बाहर जाएँ<small>\"प्लान पूरा। दिन पूरा।\"</small>",
    "<span style=\"color:#ff9aab\">😎 KEPT TRADING</span><b style=\"color:#ff5470\">−₹5,400</b><small>Peak +₹7,100 · 9 trades · 4 rules broken</small>": "<span style=\"color:#ff9aab\">😎 ट्रेड करता रहा</span><b style=\"color:#ff5470\">−₹5,400</b><small>शिखर +₹7,100 · 9 ट्रेड · 4 नियम टूटे</small>",
    "<span style=\"color:#9be8c9\">🌳 LOGGED OFF</span><b style=\"color:#22d39a\">+₹6,200</b><small>2 trades · plan followed · evening off</small>": "<span style=\"color:#9be8c9\">🌳 ऐप बंद किया</span><b style=\"color:#22d39a\">+₹6,200</b><small>2 ट्रेड · प्लान माना · शाम फ़्री</small>",
    "<i>🎯</i><span><b>Decide before 9:15:</b> daily profit target, max loss and max number of trades. Write them down.</span>": "<i>🎯</i><span><b>9:15 से पहले तय करें:</b> दिन का मुनाफ़ा टारगेट, अधिकतम नुकसान और अधिकतम ट्रेड। इन्हें लिख लें।</span>",
    "<i>🔒</i><span><b>Target hit → log off.</b> Close the trading app, close the charts, and leave the desk.</span>": "<i>🔒</i><span><b>टारगेट पूरा → ऐप बंद।</b> ट्रेडिंग ऐप बंद करें, चार्ट बंद करें, और डेस्क से उठ जाएँ।</span>",
    "<i>🌳</i><span><b>Go out.</b> A walk, chai, the gym, family time. Distance from the screen protects the profit.</span>": "<i>🌳</i><span><b>बाहर जाएँ।</b> टहलना, चाय, जिम, परिवार के साथ समय। स्क्रीन से दूरी मुनाफ़ा बचाती है।</span>",
    "<i>✋</i><span><b>Two losses in a row → stop for the day.</b> The third trade is usually the angry one.</span>": "<i>✋</i><span><b>लगातार दो नुकसान → उस दिन बस।</b> तीसरा ट्रेड आमतौर पर ग़ुस्से वाला होता है।</span>",
    "<i>⚖️</i><span><b>Never increase size to \"win it back\"</b>, never move the stop-loss, never average a loser.</span>": "<i>⚖️</i><span><b>\"वापस जीतने\" के लिए कभी साइज़ न बढ़ाएँ</b>, कभी स्टॉप-लॉस न खिसकाएँ, कभी हारे ट्रेड में एवरेज न करें।</span>",
    "<i>📉</i><span><b>Protect the peak:</b> if you give back 30% of the day's best P&amp;L, stop.</span>": "<i>📉</i><span><b>शिखर बचाएँ:</b> अगर दिन के सबसे अच्छे P&L का 30% लौटा दें, तो रुक जाएँ।</span>",
    "<i>📝</i><span><b>Review the day</b> in the evening. Good days and bad days both teach.</span>": "<i>📝</i><span>शाम को <b>दिन का रिव्यू करें</b>। अच्छे और बुरे दोनों दिन सिखाते हैं।</span>",
    "From <em>+₹7,100</em> to −₹5,400.": "<em>+₹7,100</em> से −₹5,400 तक।", "+₹6,200, <em>locked in.</em>": "+₹6,200, <em>पक्के।</em>",
    "<b>The plan</b>": "<b>प्लान</b>",
  };
  const P = {
    "⏸ 10:30 AM · YOUR CALL": "⏸ सुबह 10:30 · आपका फ़ैसला", "He's up ₹6,200. Target was ₹5,000.": "वह ₹6,200 मुनाफ़े में है। टारगेट ₹5,000 था।",
    "The plan says: target hit → stop for the day. But the market is moving and he feels unstoppable…": "प्लान कहता है: टारगेट पूरा → उस दिन बस। पर बाज़ार चल रहा है और वह ख़ुद को रोक नहीं पा रहा…",
    "How to stop overtrading": "ओवरट्रेडिंग कैसे रोकें", "✍️ Make my trading rules": "✍️ मेरे ट्रेडिंग नियम बनाएँ", "DAILY TARGET ₹": "दिन का टारगेट ₹", "MAX LOSS ₹": "अधिकतम नुकसान ₹", "MAX TRADES": "अधिकतम ट्रेड",
    "💌 Share my rules on WhatsApp": "💌 मेरे नियम WhatsApp पर शेयर करें", "📋 Copy": "📋 कॉपी", "📝 Review my day": "📝 मेरे दिन का रिव्यू", "🎯 Stop-loss calculator": "🎯 स्टॉप-लॉस कैलकुलेटर", "📺 The TV Tip Trap": "📺 TV टिप का जाल", "↺ Watch both again": "↺ दोनों फिर से देखें",
    "A fictional, illustrative story for learning. Amounts are examples. I'm not SEBI-registered and this isn't investment advice. Trading, especially intraday and F&O, carries a high risk of loss.": "सीखने के लिए एक काल्पनिक, उदाहरण वाली कहानी। रकम सिर्फ़ उदाहरण हैं। मैं SEBI-रजिस्टर्ड नहीं हूँ और यह निवेश सलाह नहीं है। ट्रेडिंग, ख़ासकर इंट्राडे और F&O, में नुकसान का बड़ा जोखिम है।",
    "Same trader, same morning, same skill. One decision at 10:30, to keep going, turned a great day into a terrible one. Overtrading rarely starts with a loss; it starts with a win that makes you feel unstoppable.": "वही ट्रेडर, वही सुबह, वही हुनर। 10:30 के एक फ़ैसले ने, यानी चलते रहने के फ़ैसले ने, बेहतरीन दिन को बहुत बुरा बना दिया। ओवरट्रेडिंग शायद ही नुकसान से शुरू होती है; यह उस जीत से शुरू होती है जो आपको अजेय महसूस कराती है।",
    "The best trade of the day was the one he didn't take. Hitting your target and walking away isn't missing out; it's how good days stay good days.": "दिन का सबसे अच्छा ट्रेड वह था जो उसने नहीं लिया। टारगेट पूरा करके उठ जाना कुछ छोड़ना नहीं है; अच्छे दिन ऐसे ही अच्छे बने रहते हैं।",
  };
  const d = { ...P }; for (const k in H) d[ser(k)] = H[k];
  MMMi18n.add(d, [
    [/^▶ Watch the other path: 🌳 log off$/, "▶ दूसरा रास्ता देखें: 🌳 ऐप बंद करें"], [/^▶ Watch the other path: 😎 keep trading$/, "▶ दूसरा रास्ता देखें: 😎 ट्रेड करते रहें"],
    [/^(\d{1,2}:\d{2}) AM$/, "सुबह $1"], [/^(\d{1,2}:\d{2}) PM$/, "दोपहर $1"],
  ], [
    [/^<b>(😎 Kept trading|🌳 Logged off|The plan)<\/b> · (.+)$/, (m, a, w) => `<b>${({ "😎 Kept trading": "😎 ट्रेड करता रहा", "🌳 Logged off": "🌳 ऐप बंद किया", "The plan": "प्लान" })[a]}</b> · ${MMMi18n.t(w)}`],
  ]);
})();
