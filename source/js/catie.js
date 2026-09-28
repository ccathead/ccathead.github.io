(() => {
  const pageLang = document.documentElement.lang || '';
  document.documentElement.dataset.contentLanguage = pageLang.startsWith('en') ? 'en' : 'zh';

  if (window.location.pathname === '/') {
    const postList = document.querySelector('#recent-posts .recent-post-items');
    if (postList && !document.querySelector('.catie-home-hero')) {
      const hero = document.createElement('section');
      hero.className = 'catie-home-hero';
      hero.innerHTML = `
        <div class="catie-home-mark">CL</div>
        <p class="catie-kicker">A PERSONAL TECHNICAL LIBRARY</p>
        <h1>Catie’s Library</h1>
        <p class="catie-home-motto">长安.</p>
        <p class="catie-home-description">技术、研究与生活中的长期记录</p>
        <p class="catie-home-description en">Notes on technology, research, and life.</p>
        <div class="catie-actions">
          <a href="/archives/">开始阅读 · Read</a>
          <a href="/projects/">浏览项目 · Projects</a>
        </div>`;
      postList.before(hero);
    }
  }
})();
