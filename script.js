function textElement(tag, text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Invalid CV text.");
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function prepareSection(id, data) {
  const section = document.getElementById(id);
  if (!section) return null;
  section.replaceChildren();
  section.hidden = Array.isArray(data.items) && data.items.length === 0;
  if (section.hidden) return null;
  if (data.eyebrow) {
    const eyebrow = textElement("p", data.eyebrow);
    eyebrow.className = "eyebrow";
    section.append(eyebrow);
  }
  const heading = textElement("h2", data.title);
  heading.id = id + "-title";
  section.append(heading);
  return section;
}

function dateElement(value) {
  const isDate = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().startsWith(value);
  const label = isDate && value.length > 4
    ? new Intl.DateTimeFormat("en", { day: value.length === 10 ? "numeric" : undefined, month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value))
    : value;
  const element = textElement(isDate ? "time" : "span", label);
  if (isDate) element.dateTime = value;
  return element;
}

function externalLink(label, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const link = textElement("a", label);
  link.href = url.href;
  return link;
}

function skillTag(text) {
  const tag = textElement("li", text);
  tag.className = "skill-tag";
  return tag;
}

function credentialBadge(item) {
  const image = new Image(112, 112);
  image.className = "credential-badge";
  image.src = item.badge;
  image.alt = "";
  return image;
}

let revealObserver;
function revealContent() {
  if (revealObserver) revealObserver.disconnect();
  const elements = document.querySelectorAll(
    ".hero-copy, .profile-panel, .stat-block, .content-section > .eyebrow, " +
    ".content-section > h2, .about-layout > *, .expertise-card, .topic, " +
    ".timeline > li, .credential-card, #faq details, #contact > p, #contact > a"
  );
  if (typeof window.IntersectionObserver !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.remove("reveal"));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  elements.forEach((element) => {
    element.classList.add("reveal");
    if (!element.classList.contains("is-visible")) revealObserver.observe(element);
  });
}

async function loadContent() {
  const status = document.getElementById("content-status");
  if (window.location.protocol === "file:") {
    status.textContent = "To load the résumé, open this page through a local web server.";
    return;
  }

  try {
    const response = await fetch("./content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Content request failed.");
    const content = await response.json();
    const { page, hero, stats, skills, contact } = content;
    const isText = (value) => typeof value === "string" && value.trim() !== "";
    if (
      !page || !["title", "language"].every((key) => isText(page[key])) ||
      !hero || !["name", "role", "tagline", "location", "availability", "intro"].every((key) => isText(hero[key])) ||
      !stats || !isText(stats.title) || !Array.isArray(stats.items) ||
      !stats.items.every((item) => item && isText(item.label) && isText(item.value)) ||
      !skills || !isText(skills.title) || !Array.isArray(skills.items) ||
      !skills.items.every((item) => item && isText(item.name)) ||
      !contact || !isText(contact.email)
    ) throw new Error("Invalid CV content.");

    document.title = page.title;
    document.documentElement.lang = page.language;
    document.querySelector('meta[name="description"]').content = page.description;
    document.getElementById("hero-eyebrow").textContent = hero.location + " · " + hero.role;
    document.getElementById("hero-name").textContent = hero.name;
    document.getElementById("hero-credentials").replaceChildren(...content.credentials.items.map((item) => {
      const credential = document.createElement("li");
      const details = document.createElement("div");
      details.append(textElement("strong", item.name),
        textElement("span", item.specialization.replace("Adobe Experience Manager", "AEM")));
      credential.append(credentialBadge(item), details);
      return credential;
    }));
    document.getElementById("hero-tagline").textContent = hero.tagline;
    document.getElementById("hero-intro").textContent = hero.intro;
    document.getElementById("hero-availability").textContent = hero.availability;
    const emailLink = document.getElementById("hero-email");
    emailLink.textContent = hero.primaryAction;
    emailLink.href = "mailto:" + contact.email;
    document.getElementById("hero-secondary").textContent = hero.secondaryAction + " ↗";
    document.getElementById("hero-download").textContent = hero.downloadAction + " ↓";
    document.getElementById("hero-text").textContent = hero.textAction;
    document.getElementById("profile-label").textContent = hero.profileLabel;
    document.getElementById("profile-initials").textContent = hero.initials;
    document.getElementById("profile-credentials").textContent = hero.credentialSummary;
    document.getElementById("profile-specializations").textContent = hero.credentialDetail;
    document.getElementById("profile-location").textContent = hero.location;
    document.getElementById("footer-name").textContent = hero.name;

    document.getElementById("stats-title").textContent = stats.title;
    document.getElementById("stats-list").replaceChildren(...stats.items.map((item) => {
      const block = document.createElement("div");
      block.className = "stat-block";
      block.append(textElement("dt", item.label), textElement("dd", item.value));
      return block;
    }));
    document.getElementById("skills-title").textContent = skills.title;
    document.getElementById("skills-list").replaceChildren(...skills.items.map((item) => skillTag(item.name)));

    const about = prepareSection("about", content.about);
    if (about) {
      const layout = document.createElement("div");
      layout.className = "about-layout";
      const copy = document.createElement("div");
      copy.className = "prose";
      copy.append(...content.about.paragraphs.map((text) => textElement("p", text)));
      const panel = document.createElement("aside");
      panel.className = "fact-panel";
      panel.append(textElement("h3", content.about.factsTitle));
      const facts = document.createElement("dl");
      facts.className = "facts";
      content.about.facts.forEach((item) => facts.append(textElement("dt", item.label), textElement("dd", item.value)));
      panel.append(facts);
      layout.append(copy, panel);
      about.append(layout);
    }

    const expertise = prepareSection("expertise", content.expertise);
    if (expertise) {
      const cards = document.createElement("div");
      cards.className = "card-grid";
      cards.append(...content.expertise.items.map((item, index) => {
        const card = document.createElement("article");
        card.className = "card expertise-card";
        const number = textElement("span", String(index + 1).padStart(2, "0"));
        number.className = "card-number";
        number.setAttribute("aria-hidden", "true");
        const tags = document.createElement("ul");
        tags.className = "skills-list";
        tags.append(...item.tags.map(skillTag));
        card.append(number, textElement("h3", item.title), textElement("p", item.description), tags);
        return card;
      }));
      expertise.append(cards);
    }

    const inDepth = prepareSection("in-depth", content.inDepth);
    if (inDepth) {
      const topics = document.createElement("div");
      topics.className = "topic-grid";
      topics.append(...content.inDepth.items.map((item) => {
        const topic = document.createElement("article");
        topic.className = "topic prose";
        topic.append(textElement("h3", item.title), textElement("p", item.summary),
          ...item.paragraphs.map((text) => textElement("p", text)));
        return topic;
      }));
      inDepth.append(topics);
    }

    const experience = prepareSection("experience", content.experience);
    if (experience) {
      const timeline = document.createElement("ol");
      timeline.className = "timeline";
      timeline.append(...content.experience.items.map((item) => {
        const entry = document.createElement("li");
        const dates = document.createElement("p");
        dates.className = "entry-meta";
        if (item.startDate) dates.append(dateElement(item.startDate), " — ");
        else dates.append("Until ");
        dates.append(dateElement(item.endDate));
        const article = document.createElement("article");
        article.className = "prose";
        article.dataset.company = item.company;
        const role = textElement("p", item.role);
        role.className = "entry-role";
        article.append(textElement("h3", item.company), role);
        if (item.location) article.append(textElement("p", item.location));
        if (item.summary) article.append(textElement("p", item.summary));
        if (item.highlights.length) {
          const highlights = document.createElement("ul");
          highlights.className = "highlights";
          highlights.append(...item.highlights.map((text) => textElement("li", text)));
          article.append(highlights);
        }
        if (item.technologies.length) {
          const technologies = document.createElement("ul");
          technologies.className = "skills-list";
          technologies.setAttribute("aria-label", content.experience.technologiesLabel);
          technologies.append(...item.technologies.map(skillTag));
          article.append(technologies);
        }
        entry.append(dates, article);
        return entry;
      }));
      experience.append(timeline);
    }

    const credentials = prepareSection("credentials", content.credentials);
    if (credentials) {
      const cards = document.createElement("div");
      cards.className = "credential-grid";
      cards.append(...content.credentials.items.map((item) => {
        const card = document.createElement("article");
        card.className = "card credential-card";
        card.append(credentialBadge(item), textElement("h3", item.name), textElement("p", item.specialization));
        const dates = document.createElement("dl");
        dates.className = "credential-dates";
        const certificationDate = document.createElement("dd");
        certificationDate.append(dateElement(item.renewedDate || item.issuedDate));
        dates.append(textElement("dt", item.renewedDate ? content.credentials.renewedLabel : content.credentials.issuedLabel), certificationDate);
        if (item.expirationDate) {
          const expiration = document.createElement("dd");
          expiration.append(dateElement(item.expirationDate));
          dates.append(textElement("dt", content.credentials.expirationLabel), expiration);
        }
        card.append(dates);
        const link = externalLink(content.credentials.verificationLabel, item.url);
        if (link) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.setAttribute("aria-label", content.credentials.verificationLabel + " — " + item.specialization + " (opens in a new tab)");
          link.append(" ↗");
          card.append(link);
        }
        return card;
      }));
      credentials.append(cards);
    }

    const testimonials = prepareSection("testimonials", content.testimonials);
    if (testimonials) {
      testimonials.append(...content.testimonials.items.map((item) => {
        const figure = document.createElement("figure");
        figure.className = "testimonial";
        const quote = document.createElement("blockquote");
        quote.append(textElement("p", item.quote));
        const author = document.createElement("figcaption");
        author.append(textElement("strong", item.name), " · ", textElement("span", item.role),
          " · ", textElement("span", item.company));
        figure.append(quote, author);
        const link = externalLink(content.testimonials.sourceLabel, item.url);
        if (link) figure.append(link);
        return figure;
      }));
    }

    const writing = prepareSection("writing-community", content.writingCommunity);
    if (writing) {
      writing.append(...content.writingCommunity.items.map((item) => {
        const article = document.createElement("article");
        article.className = "topic prose";
        const title = textElement("h3", item.title);
        const link = externalLink(item.title, item.url);
        if (link) title.replaceChildren(link);
        article.append(title, textElement("p", item.description));
        return article;
      }));
    }

    const faq = prepareSection("faq", content.faq);
    if (faq) {
      faq.append(...content.faq.items.map((item) => {
        const details = document.createElement("details");
        details.append(textElement("summary", item.question), textElement("p", item.answer));
        return details;
      }));
    }

    const contactSection = prepareSection("contact", contact);
    if (contactSection) {
      const email = textElement("a", contact.email);
      email.className = "contact-address";
      email.href = "mailto:" + contact.email;
      contactSection.append(textElement("p", contact.intro), email);
      const linkedin = externalLink(contact.linkedinLabel, contact.linkedinUrl);
      if (linkedin) contactSection.append(linkedin);
    }

    document.getElementById("page-title").hidden = true;
    document.querySelector(".loading-state").hidden = true;
    document.getElementById("cv-content").hidden = false;
    status.textContent = "";
    revealContent();
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
    scheduleScrollUpdate();
    document.dispatchEvent(new Event("cv-content-ready"));
  } catch {
    status.textContent = "The résumé could not be loaded. Please reload the page.";
  }
}

const menuToggle = document.getElementById("menu-toggle");
const navigation = document.getElementById("primary-navigation");
const siteHeader = document.querySelector(".site-header");
const readingProgress = document.getElementById("reading-progress");
const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')].map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1))
})).filter((item) => item.section);
let scrollFrame = 0;
function updateScrollState() {
  scrollFrame = 0;
  const maximum = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
  readingProgress.style.transform = "scaleX(" + progress + ")";
  const offset = siteHeader.offsetHeight + 40;
  let current = null;
  sectionLinks.forEach((item) => {
    if (item.section.hidden || !item.section.offsetHeight) return;
    if (item.section.getBoundingClientRect().top <= offset || progress === 1) current = item.link;
  });
  sectionLinks.forEach(({ link }) => {
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function scheduleScrollUpdate() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
}

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", scheduleScrollUpdate);
document.addEventListener("toggle", scheduleScrollUpdate, true);
document.fonts.ready.then(scheduleScrollUpdate);
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", revealContent);

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  navigation.dataset.open = String(open);
}
menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.querySelector(".site-header").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

loadContent();
