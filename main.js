(function () {
  // ========================================
  // 1. DOM Cache / 页面元素缓存
  // ========================================
  var header = document.getElementById("header");
  var heroShowreel = document.getElementById("hero-showreel");
  var heroShowreelEnabled = window.HERO_SHOWREEL_ENABLED !== false;
  var showreelTrigger = document.getElementById("hero-showreel-trigger");
  var showreelModal = document.getElementById("showreel-modal");
  var showreelDialog = document.getElementById("showreel-dialog");
  var showreelPlayer = document.getElementById("showreel-player");
  var showreelClose = document.getElementById("showreel-close");
  var showreelPlayToggle = document.getElementById("showreel-play-toggle");
  var showreelProgress = document.getElementById("showreel-progress");
  var showreelTime = document.getElementById("showreel-time");
  var projectsSection = document.getElementById("projects");
  var projectBottomNav = document.getElementById("project-bottom-nav");
  var projectBottomLinks = Array.prototype.slice.call(
    document.querySelectorAll('[data-project-nav]')
  );
var pageLoader = document.getElementById("page-loader");
var pageLoaderAnimation = null;
var pageLoaderHidden = false;
var pageLoaderJsonPath = window.SITE_LOADER_JSON_PATH || "./assets/loading.json";
var pageLoaderMinDuration = 1200;
var pageLoaderStartTime = 0;
  
if (heroShowreel && !heroShowreelEnabled) {
  heroShowreel.classList.add("is-hidden");
}

// ========================================
// 2. Page Loader / 页面加载动画
// ========================================
function createPageLoader() {
  pageLoader = document.getElementById("page-loader");
  if (!pageLoader) return null;
  pageLoaderStartTime = Date.now();
  pageLoaderHidden = false;
  pageLoader.classList.remove("is-hidden");
  pageLoader.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-loading");
  return pageLoader;
}

function initPageLoader() {
  createPageLoader();

  var text = document.querySelector(".page-loader__text");

  if (!window.lottie) {
    console.error("Lottie 未加载成功");
    if (text) text.textContent = "Lottie load failed";
    return;
  }

  var container = document.getElementById("page-loader-lottie");
  if (!container) {
    console.error("Lottie 容器不存在");
    if (text) text.textContent = "Container missing";
    return;
  }

  if (text) {
    text.style.display = "";
    text.textContent = "Loading";
  }

  fetch(pageLoaderJsonPath, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("JSON 请求失败: " + response.status + " " + response.statusText);
      }
      return response.json();
    })
    .then(function (animationData) {
      pageLoaderAnimation = window.lottie.loadAnimation({
        container: container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          progressiveLoad: true,
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      pageLoaderAnimation.addEventListener("data_ready", function () {
        if (text) text.style.display = "none";
      });

      pageLoaderAnimation.addEventListener("DOMLoaded", function () {
        if (text) text.style.display = "none";
      });

      pageLoaderAnimation.addEventListener("data_failed", function () {
        console.error("Lottie JSON 解析或渲染失败:", pageLoaderJsonPath);
        if (text) text.textContent = "Animation failed";
      });
    })
    .catch(function (error) {
      console.error("加载 loading.json 失败:", error);
      if (text) text.textContent = "Animation failed";
    });
}

function hidePageLoader() {
  if (!pageLoader || pageLoaderHidden) return;

  var elapsed = Date.now() - pageLoaderStartTime;
  var remaining = Math.max(0, pageLoaderMinDuration - elapsed);

  window.setTimeout(function () {
    if (!pageLoader || pageLoaderHidden) return;

    pageLoaderHidden = true;
    pageLoader.classList.add("is-hidden");
    pageLoader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-loading");

    window.setTimeout(function () {
      if (
        pageLoaderAnimation &&
        typeof pageLoaderAnimation.destroy === "function"
      ) {
        pageLoaderAnimation.destroy();
      }

      if (pageLoader && pageLoader.parentNode) {
        pageLoader.parentNode.removeChild(pageLoader);
      }

      pageLoader = null;
      pageLoaderAnimation = null;
    }, 450);
  }, remaining);
}

initPageLoader();

window.addEventListener("DOMContentLoaded", function () {
  window.setTimeout(hidePageLoader, 120);
});

// ========================================
// 2. Showreel Helpers / 视频播放辅助
// ========================================
  function formatTime(seconds) {
    if (!isFinite(seconds)) return "00:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function updateShowreelUI() {
    if (!showreelPlayer) return;
    var duration = showreelPlayer.duration || 0;
    var current = showreelPlayer.currentTime || 0;
    if (showreelProgress) {
      showreelProgress.value = duration ? (current / duration) * 100 : 0;
    }
    if (showreelTime) {
      showreelTime.textContent = formatTime(current) + " / " + formatTime(duration);
    }
    if (showreelPlayToggle) {
      showreelPlayToggle.textContent = showreelPlayer.paused ? "播放" : "暂停";
    }
  }

  // ========================================
  // 3. Showreel Open / Close / 视频弹窗开关
  // ========================================
  function openShowreel() {
    if (!showreelModal || !showreelPlayer) return;

    // 补偿滚动条消失带来的页面宽度变化，避免 header 横向跳动
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = scrollbarWidth + "px";
      if (header) header.style.paddingRight = scrollbarWidth + "px";
    }

    showreelModal.classList.add("is-open");
    showreelModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("showreel-open");
    document.documentElement.classList.add("showreel-open");
    showreelPlayer.currentTime = 0;
    showreelPlayer.muted = false;
    showreelPlayer.volume = 1;
    showreelPlayer.play().catch(function () {});
    updateShowreelUI();
  }

  function closeShowreel() {
    if (!showreelModal || !showreelPlayer) return;
    showreelModal.classList.remove("is-open");
    showreelModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("showreel-open");
    document.documentElement.classList.remove("showreel-open");
    document.body.style.paddingRight = "";
    if (header) header.style.paddingRight = "";
    showreelPlayer.pause();
  }

  // ========================================
  // 4. Showreel Events / 视频相关事件
  // ========================================
  if (showreelTrigger && showreelModal && showreelPlayer) {
    showreelTrigger.addEventListener("click", openShowreel);
    showreelTrigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openShowreel();
      }
    });
  }

  if (showreelClose) {
    showreelClose.addEventListener("click", closeShowreel);
  }

  if (showreelModal) {
    showreelModal.addEventListener("click", function (e) {
      if (e.target === showreelModal) closeShowreel();
    });
  }

  if (showreelDialog) {
    showreelDialog.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && showreelModal && showreelModal.classList.contains("is-open")) {
      closeShowreel();
    }
  });

  if (showreelPlayToggle && showreelPlayer) {
    showreelPlayToggle.addEventListener("click", function () {
      if (showreelPlayer.paused) showreelPlayer.play().catch(function () {});
      else showreelPlayer.pause();
      updateShowreelUI();
    });
  }

  if (showreelProgress && showreelPlayer) {
    showreelProgress.addEventListener("input", function () {
      var duration = showreelPlayer.duration || 0;
      if (!duration) return;
      showreelPlayer.currentTime = (Number(showreelProgress.value) / 100) * duration;
      updateShowreelUI();
    });
  }

  if (showreelPlayer) {
    showreelPlayer.addEventListener("timeupdate", updateShowreelUI);
    showreelPlayer.addEventListener("loadedmetadata", updateShowreelUI);
    showreelPlayer.addEventListener("play", updateShowreelUI);
    showreelPlayer.addEventListener("pause", updateShowreelUI);
    showreelPlayer.addEventListener("ended", updateShowreelUI);
  }

  if (!header) return;

  // ========================================
  // 5. Header Scroll / 顶部导航滚动逻辑
  // ========================================
  var lastScrollY = window.scrollY || 0;

  function updateHeaderByScroll() {
    var y = window.scrollY || 0;
    if (y <= 8) {
      header.classList.remove("nav-hidden");
      lastScrollY = y;
      return;
    }
    if (y > lastScrollY + 2) header.classList.add("nav-hidden");
    else if (y < lastScrollY - 2) header.classList.remove("nav-hidden");
    lastScrollY = y;
  }

  // ========================================
  // 6. Top Nav Active State / 顶部导航高亮
  // ========================================
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('header#header nav a[href^="#"]')
  );

  function setActiveByHash(hash) {
    if (!hash) return;
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === hash);
    });
  }

  function setActiveByScroll() {
    var headerH = header ? header.getBoundingClientRect().height : 0;
    var y = (window.scrollY || 0) + headerH + 24;
    var current = null;
    ["#hero", "#projects", "#resume", "#footer"].forEach(function (id) {
      var el = document.querySelector(id);
      if (!el) return;
      if (y >= el.offsetTop) current = id;
    });
    if (current) setActiveByHash(current);
  }

  // ========================================
  // 7. Bottom Project Nav / 底部项目导航
  // ========================================
  function setProjectBottomActive(hash) {
    projectBottomLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-project-nav") === hash);
    });
  }

  function updateProjectBottomNav() {
    if (!projectsSection || !projectBottomNav) return;
    var footer = document.getElementById("footer");
    var scrollY = window.scrollY || 0;
    var headerH = header ? header.getBoundingClientRect().height : 0;
    var start = projectsSection.offsetTop - headerH - 40;
    var end = footer ? footer.offsetTop - window.innerHeight * 0.45 : Number.POSITIVE_INFINITY;

    // 只在项目区滚动范围内显示底部导航
    var visible = scrollY >= start && scrollY < end;
    projectBottomNav.classList.toggle("is-visible", visible);

    var currentProject = null;
    ["#project-hmi", "#project-app", "#project-energy", "#project-construction"].forEach(function (id) {
      var el = document.querySelector(id);
      if (!el) return;
      if (scrollY + headerH + 120 >= el.offsetTop) currentProject = id;
    });
    if (currentProject) setProjectBottomActive(currentProject);
  }

  // ========================================
  // 8. Event Binding / 事件绑定
  // ========================================
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      setActiveByHash(a.getAttribute("href"));
    });
  });

  projectBottomLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setProjectBottomActive(link.getAttribute("data-project-nav"));
    });
  });

  if (location.hash) setActiveByHash(location.hash);
  else setActiveByScroll();

  window.addEventListener("hashchange", function () {
    setActiveByHash(location.hash);
  });

  // ========================================
  // 9. Scroll + Mousemove / 滚动与顶部唤出
  // ========================================
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateHeaderByScroll();
        setActiveByScroll();
        updateProjectBottomNav();
        ticking = false;
      });
    },
    { passive: true }
  );

  var revealZone = 24;
  var revealTicking = false;
  window.addEventListener(
    "mousemove",
    function (e) {
      if (e.clientY > revealZone) return;
      if (revealTicking) return;
      revealTicking = true;
      requestAnimationFrame(function () {
        header.classList.remove("nav-hidden");
        revealTicking = false;
      });
    },
    { passive: true }
  );

  // ========================================
  // 10. Init / 初始化
  // ========================================
  updateHeaderByScroll();
  setActiveByScroll();
  updateProjectBottomNav();
})();