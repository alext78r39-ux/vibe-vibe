import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick, h, type VNode, defineComponent, ref } from 'vue'
import { useRoute, useData } from 'vitepress'
import mediumZoom from 'medium-zoom'
import Giscus from '@giscus/vue'
// Chapter 01: Environment Setup (flat naming: 01-0 for preface, 01-1 for main content)
import InteractiveDemo from './components/01-0-InteractiveDemo.vue'
import NodeVersionManager from './components/01-0-NodeVersionManager.vue'
import TerminalPro from './components/01-0-TerminalPro.vue'
import TerminalSimulator from './components/01-0-TerminalSimulator.vue'
import FileSystemTree from './components/01-1-FileSystemTree.vue'
import NetworkPorts from './components/01-1-NetworkPorts.vue'
import PackageEcosystem from './components/01-1-PackageEcosystem.vue'
import TypeScriptCompiler from './components/01-1-TypeScriptCompiler.vue'
import CodeFormatEvolution from './components/01-1-CodeFormatEvolution.vue'
import TechStackLayers from './components/01-1-TechStackArchitecture.vue'
import BrowserServerFlow from './components/01-1-BrowserServerFlow.vue'
import TerminalTroubleshoot from './components/01-1-TerminalTroubleshoot.vue'
import ReadingProgress from './components/01-2-ReadingProgress.vue'

// 引入时间线样式
import "vitepress-markdown-timeline/dist/theme/index.css";
import './custom.css' // 稍后创建这个文件，用于微调样式

type BeforeInstallPromptUserChoice = {
  outcome: 'accepted' | 'dismissed'
  platform: string
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<BeforeInstallPromptUserChoice>
}

const PwaInstallButton = defineComponent({
  name: 'PwaInstallButton',
  setup() {
    const canInstall = ref(false)
    const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
    const isStandalone = ref(false)
    const isPwaSupported = ref(false)

    const updateStandalone = () => {
      const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
      isStandalone.value =
        window.matchMedia('(display-mode: standalone)').matches ||
        navigatorWithStandalone.standalone === true
    }

    onMounted(() => {
      isPwaSupported.value =
        window.isSecureContext &&
        'serviceWorker' in navigator

      if (isPwaSupported.value) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => null)
      }

      updateStandalone()

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt.value = e as BeforeInstallPromptEvent
        canInstall.value = true
      })

      window.addEventListener('appinstalled', () => {
        canInstall.value = false
        deferredPrompt.value = null
        updateStandalone()
      })
    })

    const onClick = async () => {
      const promptEvent = deferredPrompt.value
      if (!promptEvent) return

      await promptEvent.prompt()
      try {
        await promptEvent.userChoice
      } finally {
        canInstall.value = false
        deferredPrompt.value = null
      }
    }

    return () => {
      if (isStandalone.value || !isPwaSupported.value) return null
      return h(
        'button',
        {
          type: 'button',
          class: 'pwa-install-button',
          onClick
        },
        '安装到桌面'
      )
    }
  }
})

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TerminalSimulator', TerminalSimulator)
    app.component('TerminalPro', TerminalPro)
    app.component('InteractiveDemo', InteractiveDemo)
    app.component('NodeVersionManager', NodeVersionManager)
    app.component('NetworkPorts', NetworkPorts)
    app.component('FileSystemTree', FileSystemTree)
    app.component('PackageEcosystem', PackageEcosystem)
    app.component('TypeScriptCompiler', TypeScriptCompiler)
    app.component('CodeFormatEvolution', CodeFormatEvolution)
    app.component('TechStackLayers', TechStackLayers)
    app.component('BrowserServerFlow', BrowserServerFlow)
    app.component('TerminalTroubleshoot', TerminalTroubleshoot)
  },

  // 1. 布局扩展：注入 Giscus 评论
  Layout: () => {
    const route = useRoute()
    const { frontmatter, isDark } = useData();

    return h(DefaultTheme.Layout, null, {
      'layout-top': () => {
        return h('div', {
          class: 'info-banner',
          style: {
            background: '#e6a23c',
            color: '#fff',
            padding: '8px',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: '1.5'
          }
        }, '⚠️ Alpha内测版本警告：此为早期内部构建版本，尚不完整且可能存在错误，欢迎大家提Issue反馈问题或建议')
      },
      'doc-after': () => {
        const children: VNode[] = [
          h('div', { class: 'feedback-tip' }, [
            h('strong', null, '反馈与建议：'),
            '发现内容有误或想补充？欢迎在下方评论区留言，或到 ',
            h(
              'a',
              {
                href: 'https://github.com/datawhalechina/vibe-vibe/issues',
                target: '_blank',
                rel: 'noopener noreferrer'
              },
              'GitHub 提 Issue'
            ),
            ,
            h('div', { class: 'feedback-actions' }, [
              h('span', { class: 'github-star-text' }, '点我给个 Star 吧：'),
              h('span', { class: 'github-star-wrap' }, [
                h('iframe', {
                  class: 'github-star-btn',
                  src: 'https://ghbtns.com/github-btn.html?user=datawhalechina&repo=vibe-vibe&type=star&count=false&size=large',
                  title: 'GitHub',
                  height: '30',
                  width: '120',
                  scrolling: '0',
                  frameborder: '0'
                })
              ]),
              h(PwaInstallButton)
            ])
          ])
        ];

        if (frontmatter.value.comment !== false) {
          children.push(
            h('div', { style: { marginTop: '2rem' } }, [
              h(Giscus, {
                key: `${route.path}::${isDark.value ? 'dark' : 'light'}`,
                repo: "datawhalechina/vibe-vibe",
                repoId: "R_kgDOQerM_g",
                category: "General",
                categoryId: "DIC_kwDOQerM_s4CzzOf",
                mapping: "pathname",
                strict: "0",
                reactionsEnabled: "1",
                emitMetadata: "1",
                inputPosition: "bottom",
                theme: isDark.value ? "dark_dimmed" : "light",
                lang: "zh-CN",
                loading: "lazy"
              })
            ])
          );
        }

        return h('div', null, children)
      },
      'layout-bottom': () => {
        return h(ReadingProgress)
      }
    })
  },

  // 2. 增强功能：图片放大
  setup() {
    const route = useRoute()

    const initZoom = () => {
      // 给主要内容区的图片添加放大功能，排除 logo 等
      // background: var(--vp-c-bg) 确保背景色适应深色模式
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }

    onMounted(() => {
      initZoom()

      // 动态计算 Banner 高度并设置 CSS 变量
      const updateBannerHeight = () => {
        const banner = document.querySelector('.info-banner')
        if (banner) {
          const height = (banner as HTMLElement).offsetHeight
          document.documentElement.style.setProperty('--vp-layout-top-height', `${height}px`)
        }
      }

      updateBannerHeight()
      window.addEventListener('resize', updateBannerHeight)
    })

    // 监听路由变化，确保切换页面后图片依然可以放大
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  }
}
