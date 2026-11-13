(() => {
  const init = () => {
    const pageLang = document.documentElement.lang || '';
    document.documentElement.dataset.contentLanguage = pageLang.startsWith('en') ? 'en' : 'zh';
    const menus = document.querySelector('#menus');
    if (menus && !document.querySelector('.catie-theme-toggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'catie-theme-toggle';
      const syncTheme = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        toggle.textContent = dark ? '☀' : '☾';
        toggle.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
      };
      toggle.addEventListener('click', () => document.getElementById('darkmode')?.click());
      menus.append(toggle);
      syncTheme();
      new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    if (window.location.pathname === '/') {
      const main = document.querySelector('#content-inner');
      const postList = document.querySelector('#recent-posts .recent-post-items');
      if (main && postList && !document.querySelector('.catie-home-hero')) {
        const hero = document.createElement('section');
        hero.className = 'catie-home-hero';
        hero.setAttribute('aria-labelledby', 'catie-home-title');
        hero.innerHTML = `<h1 id="catie-home-title">Nice to Meet you</h1>
          <p class="catie-home-motto">长安.</p>`;
        main.before(hero);
        const intro = document.createElement('div');
        intro.className = 'catie-home-intro';
        intro.innerHTML = '<p lang="fr">Je veux la gloire à mes genoux</p>';
        const heading = document.createElement('div');
        heading.className = 'catie-list-heading';
        heading.innerHTML = '<h2>最新文章<span>Recent writing</span></h2><a href="/archives/">全部文章 →</a>';
        postList.before(intro, heading);
      }
    }
  };
  init();
  document.addEventListener('pjax:complete', init);
})();
