(function () {
  const ser = html => { const e = document.createElement("div"); e.innerHTML = html; return e.innerHTML.replace(/\s+/g, " ").trim(); };
  const H = {
    /* story captions (shown with inline <i> highlights) */
    "Days before the show. <i>XYZ Ltd</i>, a tiny small-cap, trades quietly around ₹100… but someone is <i>buying, quietly</i>.": "शो से कुछ दिन पहले। एक छोटी-सी स्मॉल-कैप <i>XYZ Ltd</i> चुपचाप ₹100 के आसपास चल रही है… पर कोई <i>चुपचाप ख़रीद रहा है</i>।",
    "Show day, 8:45 AM. On TV: <i>\"Stock to buy NOW: XYZ Ltd. Target ₹160!\"</i> Lakhs of people are watching.": "शो का दिन, सुबह 8:45। TV पर: <i>\"अभी ख़रीदें: XYZ Ltd। टारगेट ₹160!\"</i> लाखों लोग देख रहे हैं।",
    "9:15 AM. Viewers rush to buy <i>at market price</i>. XYZ jumps 20% in minutes.": "सुबह 9:15। दर्शक <i>मार्केट भाव पर</i> ख़रीदने टूट पड़ते हैं। XYZ मिनटों में 20% उछल जाता है।",
    "Behind the scenes: the people who bought early are <i>selling everything</i>, straight to the TV buyers.": "पर्दे के पीछे: जिन्होंने पहले ख़रीदा था वे <i>सब कुछ बेच रहे हैं</i>, सीधे TV वाले ख़रीदारों को।",
    "10:05 AM. The chart looks unstoppable…": "सुबह 10:05। चार्ट रुकता नहीं दिख रहा…",
    "You buy at <i>₹141</i>, near the top. A few minutes later, the buying dries up.": "आप <i>₹141</i> पर, लगभग शिखर पर ख़रीदते हैं। कुछ मिनट बाद ख़रीदारी थम जाती है।",
    "Over the next days there are no new buyers. XYZ slides to <i>₹96</i>, below where it started. The TV has moved on to its <i>next</i> hot tip.": "अगले दिनों में कोई नया ख़रीदार नहीं। XYZ फिसलकर <i>₹96</i> पर आ जाता है, जहाँ से चला था उससे भी नीचे। TV अपनी <i>अगली</i> गरम टिप पर जा चुका है।",
    "You're down <i>32%</i>. The early buyers made 20–40%, and the money they took home came from the people who bought on the tip.": "आप <i>32%</i> नुकसान में हैं। पहले ख़रीदने वालों ने 20–40% कमाए, और जो पैसा वे घर ले गए वह टिप पर ख़रीदने वालों का था।",
    "You open the chart first. XYZ had <i>already risen 18% in the week before the show</i>, on unusual volume. 🚩": "आप पहले चार्ट खोलते हैं। XYZ <i>शो से पहले वाले हफ़्ते में ही 18% चढ़ चुका था</i>, असामान्य वॉल्यूम पर। 🚩",
    "And the order book shows <i>huge sell orders</i> sitting above the price. Someone is selling into the hype. You skip it.": "और ऑर्डर बुक में भाव के ऊपर <i>भारी बिक्री ऑर्डर</i> बैठे हैं। कोई हवा में बेच रहा है। आप इसे छोड़ देते हैं।",
    "A week later XYZ is back at <i>₹96</i>. You lost nothing, and you learned to <i>check before you chase</i>.": "एक हफ़्ते बाद XYZ वापस <i>₹96</i> पर है। आपने कुछ नहीं गँवाया, और सीखा कि <i>पीछा करने से पहले जाँचें</i>।",
    /* chapter labels */
    "<b>The tip</b>": "<b>टिप</b>",
    /* static */
    "<b>📺 The TV Tip Trap</b><span>how front-running works · a 3D story</span>": "<b>📺 TV टिप का जाल</b><span>फ़्रंट-रनिंग कैसे होती है · एक 3D कहानी</span>",
    "<a href=\"../overtrading/\">🎬 10:30 Decision</a><a href=\"../\">← Home</a>": "<a href=\"../overtrading/\">🎬 10:30 का फ़ैसला</a><a href=\"../\">← होम</a>",
    "\"Stock to buy <em>NOW!</em>\"<br>Who's really making money?": "\"<em>अभी</em> ख़रीदो!\"<br>असल में पैसा कौन बना रहा है?",
    "A 2-minute 3D story about TV tips and front-running. At the peak, <b>you</b> decide.": "TV टिप्स और फ़्रंट-रनिंग पर 2 मिनट की 3D कहानी। शिखर पर फ़ैसला <b>आप</b> करेंगे।",
    "⏸ 10:05 AM · YOUR CALL": "⏸ सुबह 10:05 · आपका फ़ैसला",
    "🚀 Buy now<small>at market price</small>": "🚀 अभी ख़रीदें<small>मार्केट भाव पर</small>", "🔍 Wait &amp; check<small>look at the chart first</small>": "🔍 रुकें और जाँचें<small>पहले चार्ट देखें</small>",
    "<span style=\"color:#cbbcff\">🕶️ BOUGHT BEFORE THE SHOW</span><b style=\"color:#b9a6ff\">+18% to +40%</b><small>bought ~₹100–118, sold ~₹135–141 to TV buyers</small>": "<span style=\"color:#cbbcff\">🕶️ शो से पहले ख़रीदा</span><b style=\"color:#b9a6ff\">+18% से +40%</b><small>~₹100–118 पर ख़रीदा, ~₹135–141 पर TV वालों को बेचा</small>",
    "<span style=\"color:#ff9aab\">🚀 BOUGHT ON THE TV TIP</span><b style=\"color:#ff5470\">−32%</b><small>bought ₹141, a week later ₹96</small>": "<span style=\"color:#ff9aab\">🚀 TV टिप पर ख़रीदा</span><b style=\"color:#ff5470\">−32%</b><small>₹141 पर ख़रीदा, हफ़्ते बाद ₹96</small>",
    "<span style=\"color:#9be8c9\">🔍 WAITED &amp; CHECKED</span><b style=\"color:#22d39a\">₹0 lost</b><small>saw the red flags and skipped</small>": "<span style=\"color:#9be8c9\">🔍 रुके और जाँचा</span><b style=\"color:#22d39a\">₹0 नुकसान</b><small>रेड फ़्लैग देखे और छोड़ दिया</small>",
    "Bought the tip at ₹141. <em>Now ₹96.</em>": "टिप पर ₹141 में ख़रीदा। <em>अब ₹96।</em>", "Checked first. <em>Lost nothing.</em>": "पहले जाँचा। <em>कुछ नहीं गँवाया।</em>",
    "<b>Front-running</b> means buying (or selling) ahead of information you know will move the price, then trading against the people who act on it. With TV or social-media tips, someone who knows a stock will be recommended buys it <b>before</b> the tip goes public, then <b>sells to the viewers</b> who rush in after it. It is market manipulation and <b>illegal in India</b>; SEBI has investigated and penalised people for exactly this pattern.": "<b>फ़्रंट-रनिंग</b> का मतलब है ऐसी जानकारी से पहले ख़रीदना (या बेचना) जो भाव हिलाएगी, फिर उस पर अमल करने वालों के ख़िलाफ़ ट्रेड करना। TV या सोशल-मीडिया टिप्स में, जिसे पता है कि किसी शेयर की सिफ़ारिश होने वाली है, वह टिप सार्वजनिक होने से <b>पहले</b> ख़रीदता है, फिर पीछे दौड़कर आने वाले <b>दर्शकों को बेच देता है</b>। यह बाज़ार में हेराफेरी है और <b>भारत में ग़ैरक़ानूनी</b> है; SEBI ने ठीक इसी तरीक़े के लिए लोगों की जाँच की है और उन पर जुर्माना लगाया है।",
    "<i>📈</i><span><b>Already up a lot</b> in the days before the tip, often 15% or more.</span>": "<i>📈</i><span>टिप से पहले के दिनों में <b>पहले ही बहुत चढ़ चुका</b>, अक्सर 15% या ज़्यादा।</span>",
    "<i>📊</i><span><b>Volume spike before</b> the news was public.</span>": "<i>📊</i><span>ख़बर सार्वजनिक होने से <b>पहले वॉल्यूम में उछाल</b>।</span>",
    "<i>🐜</i><span><b>Small or illiquid stock:</b> easy to push up and hard to exit.</span>": "<i>🐜</i><span><b>छोटा या कम कारोबार वाला शेयर:</b> ऊपर धकेलना आसान, निकलना मुश्किल।</span>",
    "<i>⏰</i><span><b>Urgency + big target:</b> \"buy NOW\", \"target ₹160 soon\".</span>": "<i>⏰</i><span><b>जल्दबाज़ी + बड़ा टारगेट:</b> \"अभी ख़रीदो\", \"जल्द ₹160\"।</span>",
    "<i>🧱</i><span><b>Big sell orders</b> waiting above the price while it gaps up.</span>": "<i>🧱</i><span>गैप-अप के दौरान भाव के ऊपर इंतज़ार करते <b>बड़े बिक्री ऑर्डर</b>।</span>",
    "<i>🪪</i><span><b>No SEBI registration:</b> check an adviser's or analyst's registration on SEBI's website.</span>": "<i>🪪</i><span><b>SEBI रजिस्ट्रेशन नहीं:</b> सलाहकार या एनालिस्ट का रजिस्ट्रेशन SEBI की वेबसाइट पर जाँचें।</span>",
    "<i>⏳</i><span><b>Never buy at market</b> into a TV or WhatsApp spike. Wait a few days; real opportunities don't vanish in an hour.</span>": "<i>⏳</i><span>TV या WhatsApp वाले उछाल में <b>कभी मार्केट भाव पर न ख़रीदें</b>। कुछ दिन रुकें; असली मौक़े एक घंटे में ग़ायब नहीं होते।</span>",
    "<i>🔍</i><span><b>Run your own checks:</b> fundamentals, the chart before the tip, volume and events.</span>": "<i>🔍</i><span><b>ख़ुद जाँच करें:</b> फ़ंडामेंटल, टिप से पहले का चार्ट, वॉल्यूम और इवेंट।</span>",
    "<i>🎯</i><span><b>Limit orders + stop-loss</b>, always, and a size you can afford to be wrong on.</span>": "<i>🎯</i><span>हमेशा <b>लिमिट ऑर्डर + स्टॉप-लॉस</b>, और उतना साइज़ जिसमें ग़लत होना आप सह सकें।</span>",
    "<i>📣</i><span><b>Suspect manipulation?</b> Don't forward it. You can report it to SEBI.</span>": "<i>📣</i><span><b>हेराफेरी का शक?</b> इसे फ़ॉरवर्ड न करें। आप SEBI को शिकायत कर सकते हैं।</span>",
  };
  const P = {
    "XYZ is up 20% today. ₹141 and rising.": "XYZ आज 20% ऊपर है। ₹141 और चढ़ रहा है।",
    "Your friend messages: \"It was on TV! Target ₹160. Buy now before it's too late 🚀\"": "दोस्त का मैसेज: \"TV पर आया था! टारगेट ₹160। देर होने से पहले अभी ख़रीद लो 🚀\"",
    "What is front-running?": "फ़्रंट-रनिंग क्या है?", "🚩 Red flags of a tip trap": "🚩 टिप के जाल के रेड फ़्लैग", "What to do instead": "इसकी जगह क्या करें",
    "🚩 Tip Trap Checker": "🚩 टिप ट्रैप चेकर", "Got a hot tip on TV, Telegram or WhatsApp? Answer honestly:": "TV, Telegram या WhatsApp पर कोई गरम टिप मिली? ईमानदारी से जवाब दें:", "💌 Share the checker": "💌 चेकर शेयर करें",
    "🖥️ How I actually analyse a stock": "🖥️ मैं असल में शेयर कैसे परखता हूँ", "🎬 The 10:30 Decision": "🎬 10:30 का फ़ैसला", "↺ Watch both again": "↺ दोनों फिर से देखें",
    "A fictional story for learning. \"XYZ Ltd\", \"Channel X\" and all prices are made up; no real person, company or channel is shown. I'm not SEBI-registered and this isn't investment advice.": "सीखने के लिए एक काल्पनिक कहानी। \"XYZ Ltd\", \"Channel X\" और सारे भाव बनाए हुए हैं; कोई असली व्यक्ति, कंपनी या चैनल नहीं दिखाया गया। मैं SEBI-रजिस्टर्ड नहीं हूँ और यह निवेश सलाह नहीं है।",
    "By the time a stock is shouted on TV, someone has often bought it already. The rush of viewers isn't the start of the move; it's the exit door for the people who bought early.": "जब तक कोई शेयर TV पर चिल्लाकर बताया जाता है, अक्सर कोई उसे पहले ही ख़रीद चुका होता है। दर्शकों की भीड़ चाल की शुरुआत नहीं; पहले ख़रीदने वालों के निकलने का दरवाज़ा है।",
    "Two minutes with the chart showed what the TV didn't: the stock had already run up before the tip, and big sellers were waiting. Skipping a trade is a decision too, and often the best one.": "चार्ट के साथ दो मिनट ने वह दिखाया जो TV ने नहीं दिखाया: टिप से पहले ही शेयर भाग चुका था, और बड़े विक्रेता इंतज़ार में थे। ट्रेड छोड़ना भी एक फ़ैसला है, और अक्सर सबसे अच्छा।",
    "Has the stock already risen 15% or more in the last week?": "क्या पिछले हफ़्ते में शेयर पहले ही 15% या ज़्यादा चढ़ चुका है?", "Was there a volume spike before the tip went public?": "क्या टिप सार्वजनिक होने से पहले वॉल्यूम में उछाल था?", "Is it a small-cap or thinly traded stock?": "क्या यह स्मॉल-कैप या कम कारोबार वाला शेयर है?", "Does the tip push urgency (\"buy NOW\") or a big target?": "क्या टिप जल्दबाज़ी (\"अभी ख़रीदो\") या बड़ा टारगेट दिखाती है?", "Is the price gapping up with big sell orders above it?": "क्या भाव गैप-अप हो रहा है और ऊपर बड़े बिक्री ऑर्डर हैं?", "Is the source NOT a SEBI-registered adviser or analyst?": "क्या टिप देने वाला SEBI-रजिस्टर्ड सलाहकार या एनालिस्ट नहीं है?",
    "Answer the questions to see your red-flag count.": "रेड फ़्लैग गिनने के लिए सवालों के जवाब दें।", "✅ No red flags so far, but still run your own analysis.": "✅ अभी तक कोई रेड फ़्लैग नहीं, फिर भी अपना एनालिसिस ख़ुद करें।",
    "Days −5 to −1": "दिन −5 से −1", "Show day · 8:45 AM": "शो का दिन · सुबह 8:45", "A week later": "एक हफ़्ते बाद", "Days +1 to +5": "दिन +1 से +5",
  };
  const d = { ...P }; for (const k in H) d[ser(k)] = H[k];
  MMMi18n.add(d, [
    [/^🚩 (\d)\/6 red flags: you're probably late to the party\. Skip it\.$/, "🚩 6 में से $1 रेड फ़्लैग: आप शायद पार्टी में देर से पहुँचे हैं। इसे छोड़ दें।"],
    [/^⚠️ (\d)\/6 red flags: be very careful\. Do your own checks first\.$/, "⚠️ 6 में से $1 रेड फ़्लैग: बहुत सावधान रहें। पहले ख़ुद जाँच करें।"],
    [/^▶ Watch the other path: 🔍 wait & check$/, "▶ दूसरा रास्ता देखें: 🔍 रुकें और जाँचें"], [/^▶ Watch the other path: 🚀 buy the tip$/, "▶ दूसरा रास्ता देखें: 🚀 टिप पर ख़रीदें"],
    [/^(\d{1,2}:\d{2}) AM$/, "सुबह $1"],
  ], [
    [/^<b>(🚀 Bought the tip|🔍 Waited &amp; checked|The tip)<\/b> · (.+)$/, (m, a, w) => `<b>${({ "🚀 Bought the tip": "🚀 टिप पर ख़रीदा", "🔍 Waited &amp; checked": "🔍 रुके और जाँचा", "The tip": "टिप" })[a]}</b> · ${MMMi18n.t(w)}`],
  ]);
})();
