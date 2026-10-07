// TIMSUN タイヤの読みもの: 一覧(カテゴリ絞り込み)と記事(?a=size)
// 記事は data.js の ARTICLES、メディア掲載は MEDIA(外部リンク)
import { ARTICLES, MEDIA } from './data.js';
import { esc } from './site.js';

const $ = (id) => document.getElementById(id);
const items = [
  ...ARTICLES.map((a) => ({ tag: a.tag, title: a.title, lead: a.lead, href: `/magazine?a=${a.slug}`, ext: false })),
  ...MEDIA.map((m) => ({ tag: 'メディア', title: m.name, lead: `${m.t}(${m.d})`, href: m.u, ext: true })),
];

function renderList(tag) {
  $('magCards').innerHTML = items.filter((x) => !tag || x.tag === tag).map((x) => `
    <a class="mag-card" href="${esc(x.href)}"${x.ext ? ' target="_blank" rel="noopener"' : ''}>
      <span class="tag${x.tag === '製品' ? ' shg' : x.tag === 'メディア' ? '' : ' muted'}">${esc(x.tag)}</span>
      <b>${esc(x.title)}${x.ext ? ' <span class="ext" aria-label="外部サイト">↗</span>' : ''}</b>
      <small>${esc(x.lead)}</small>
    </a>`).join('');
}

function renderArticle(a) {
  document.title = `${a.title}|タイヤの読みもの|TIMSUN(ティムソン)日本公式サイト`;
  $('crumb').innerHTML = `<li><a href="/">TOP</a></li><li><a href="/magazine">タイヤの読みもの</a></li><li>${esc(a.title)}</li>`;
  $('magHead').innerHTML = `<p class="eyebrow mag-eyebrow">${esc(a.tag)}</p><h1 class="h1">${esc(a.title)}</h1><p class="lead">${esc(a.lead)}</p>`;
  const body = a.body.map(([k, v]) => k === 'dl'
    ? `<table class="spec size-table">${v.map(([d, t]) => `<tr><th class="en">${esc(d)}</th><td>${esc(t)}</td></tr>`).join('')}</table>`
    : `<p>${esc(v)}</p>`).join('');
  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  $('magArticle').innerHTML = `
    <div class="wrap article">
      <div class="prose">${body}</div>
      ${a.link ? `<p class="mt-m"><a class="btn" href="${esc(a.link[0])}">${esc(a.link[1])}</a></p>` : ''}
      <h2 class="h3 mt-l">ほかの読みもの</h2>
      <div class="mag-list mt-m">${others.map((x) => `<a class="mag-card" href="/magazine?a=${x.slug}"><span class="tag muted">${esc(x.tag)}</span><b>${esc(x.title)}</b><small>${esc(x.lead)}</small></a>`).join('')}</div>
    </div>`;
}

const slug = new URLSearchParams(location.search).get('a');
const art = slug && ARTICLES.find((x) => x.slug === slug);
if (art) {
  $('magList').hidden = true; $('magArticle').hidden = false; renderArticle(art);
} else {
  renderList('');
  $('magFilters').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('#magFilters button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderList(b.dataset.t);
  });
}
