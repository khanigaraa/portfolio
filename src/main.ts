import './styles.css';
import { content } from './content';
import { browserStorage, getLang, initLang, onLangChange } from './i18n';
import { runIntro } from './intro/intro';
import { INTRO_SEEN_KEY, shouldPlayIntro } from './intro/machine';
import { createMotion, reducedMotion } from './motion';
import { aboutPage } from './pages/about';
import { lobbyPage } from './pages/lobby';
import { notFoundPage } from './pages/not-found';
import { projectDetailPage, projectListPage } from './pages/projects';
import { writingDetailPage, writingListPage } from './pages/writing';
import { createRouter } from './router';
import { createShell } from './ui/shell';

// Language first: everything below renders in it.
const lang = initLang({ search: location.search, storage: browserStorage(), browserLangs: navigator.languages });
document.documentElement.lang = lang;
// A shared ?lang= link has been applied and remembered; drop it so the toggle stays in charge.
const url = new URL(location.href);
if (url.searchParams.has('lang')) {
  url.searchParams.delete('lang');
  history.replaceState(null, '', url);
}

const outlet = document.getElementById('main')!;
const introStorage = browserStorage();
let introPlaying = false;
const playIntro = async () => {
  if (introPlaying) return;
  introPlaying = true;
  const p = content.profile(getLang());
  await runIntro({ name: p.name, nickname: p.nickname, role: p.role });
  introStorage.set(INTRO_SEEN_KEY, '1');
  introPlaying = false;
};
const shell = createShell(document.getElementById('site-header')!, document.getElementById('site-footer')!, {
  onReplayIntro: () => void playIntro(),
});
const motion = createMotion(outlet);

const router = createRouter(outlet, notFoundPage, {
  ...motion.hooks,
  enter(el, info) {
    shell.setActive(info.url.pathname);
    motion.hooks.enter(el, info);
  },
})
  .add('/', lobbyPage)
  .add('/projects', projectListPage)
  .add('/projects/:slug', projectDetailPage)
  .add('/about', aboutPage)
  .add('/writing', writingListPage)
  .add('/writing/:slug', writingDetailPage);

onLangChange((next) => {
  document.documentElement.lang = next;
  shell.render();
  router.refresh();
});

router.start();

// First visit to the lobby: the matchmaking intro plays over the (already rendered) page.
if (
  shouldPlayIntro({
    pathname: location.pathname,
    seen: introStorage.get(INTRO_SEEN_KEY) === '1',
    reducedMotion: reducedMotion(),
  })
)
  void playIntro();
