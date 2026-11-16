(() => {
  const quizItems = [
    {
      q: "What mineral supplied more than 90% of Silver Reef’s silver?",
      choices: [
        "Native silver wires in quartz veins",
        "Chlorargyrite (horn silver, AgCl)",
        "Galena with silver-rich tetrahedrite",
        "Argentite veins cutting granite",
      ],
      answer: 1,
      why: "UGS: over 90% of district silver was silver chloride—chlorargyrite / horn silver—disseminated in sandstone.",
    },
    {
      q: "Which rock unit hosts the ore beds?",
      choices: [
        "Navajo Sandstone dune cliffs only",
        "Basalt of the Santa Clara flow",
        "Springdale Sandstone Member of the Kayenta Formation",
        "Salt beds of the Carmel Formation",
      ],
      answer: 2,
      why: "Ore is in Springdale Sandstone (the historic Silver Reef sandstone), now placed in the Kayenta Formation.",
    },
    {
      q: "Why was discovery so hard for early prospectors to believe?",
      choices: [
        "Silver was only found in river placer bars",
        "Economic silver in essentially unaltered sandstone was almost unheard of",
        "The ore glowed under ultraviolet light",
        "Claims were entirely underwater",
      ],
      answer: 1,
      why: "High-grade ore was found in 1866, but sandstone-hosted silver without obvious alteration delayed the rush about a decade.",
    },
    {
      q: "What often makes Silver Reef ore visible in hand specimen?",
      choices: [
        "Bright metallic silver coatings",
        "Strong rose quartz gangue",
        "Colorful copper (and sometimes uranium) minerals with plant fragments",
        "Large cubic pyrite crystals",
      ],
      answer: 2,
      why: "Horn silver itself is drab; azurite, malachite, and U–V minerals on organics flag many ore pods.",
    },
    {
      q: "Which reef produced roughly 70% of the district’s silver?",
      choices: ["White Reef", "East Reef", "Butte Reef", "Buckeye Reef"],
      answer: 3,
      why: "Buckeye Reef was the prolific producer on the northwest flank of the Virgin anticline.",
    },
    {
      q: "What structural trap helped concentrate mineralizing fluids?",
      choices: [
        "A collapsed caldera lake",
        "The northeast-plunging Virgin anticline",
        "A salt diapir piercing the Navajo",
        "Glacial overdeepening",
      ],
      answer: 1,
      why: "Fluids trapped along porous Springdale beds on the folded Virgin anticline nose.",
    },
    {
      q: "Fresh underground chlorargyrite is often described as…",
      choices: [
        "Always metallic and mirror-bright",
        "Colorless to grayish white, darkening after light exposure",
        "Neon green fluorescent",
        "Magnetic and heavy like magnetite",
      ],
      answer: 1,
      why: "UGS: horn silver is colorless/grayish white underground and turns grayish brown in sunlight—easy to miss.",
    },
    {
      q: "A cross-bedded red sandstone without copper stains at Silver Reef most likely means…",
      choices: [
        "It must assay hundreds of ounces of silver",
        "It is automatically Springdale ore rock",
        "Sedimentary fabric alone does not prove mineralization",
        "It is illegal to photograph",
      ],
      answer: 2,
      why: "Ordinary sandstone fabrics are common; mineralization needs supporting mineralogical or analytical evidence.",
    },
  ];

  /* Tabs */
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = {
    "tab-chlor": document.getElementById("panel-chlor"),
    "tab-sand": document.getElementById("panel-sand"),
    "tab-copper": document.getElementById("panel-copper"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      Object.entries(panels).forEach(([id, panel]) => {
        panel.hidden = id !== tab.id;
      });
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");

  function openLightbox(src, caption, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
  }

  document.querySelectorAll("img[data-full]").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      openLightbox(img.dataset.full || img.src, img.dataset.caption || "", img.alt);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  /* Quiz */
  let index = 0;
  let score = 0;
  let locked = false;

  const progressEl = document.getElementById("quiz-progress");
  const questionEl = document.getElementById("quiz-question");
  const optionsEl = document.getElementById("quiz-options");
  const feedbackEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next");
  const restartBtn = document.getElementById("quiz-restart");

  function renderQuestion() {
    locked = false;
    const item = quizItems[index];
    progressEl.textContent = `Question ${index + 1} of ${quizItems.length}`;
    questionEl.textContent = item.q;
    feedbackEl.textContent = "";
    nextBtn.hidden = true;
    restartBtn.hidden = true;
    optionsEl.innerHTML = "";

    item.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = choice;
      btn.addEventListener("click", () => selectAnswer(i, btn));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(i, btn) {
    if (locked) return;
    locked = true;
    const item = quizItems[index];
    const buttons = [...optionsEl.querySelectorAll("button")];
    buttons.forEach((b) => (b.disabled = true));

    if (i === item.answer) {
      btn.classList.add("correct");
      score += 1;
      feedbackEl.textContent = `Correct. ${item.why}`;
    } else {
      btn.classList.add("wrong");
      buttons[item.answer].classList.add("correct");
      feedbackEl.textContent = `Not quite. ${item.why}`;
    }

    nextBtn.hidden = true;
    restartBtn.hidden = true;
    if (index < quizItems.length - 1) {
      nextBtn.hidden = false;
      nextBtn.textContent = "Next question";
      nextBtn.focus();
    } else {
      feedbackEl.textContent += ` Final score: ${score} / ${quizItems.length}.`;
      restartBtn.hidden = false;
      restartBtn.focus();
    }
  }

  nextBtn.addEventListener("click", () => {
    index += 1;
    renderQuestion();
  });

  restartBtn.addEventListener("click", () => {
    index = 0;
    score = 0;
    renderQuestion();
  });

  renderQuestion();

  /* Active nav */
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const match = link.getAttribute("href") === `#${id}`;
          if (match) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => observer.observe(section));
})();
