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
import PackageManagerCompare from './components/01-1-PackageManagerCompare.vue'
import PackageJsonExplorer from './components/01-1-PackageJsonExplorer.vue'
import AIToolSelector from './components/01-1-AIToolSelector.vue'
import ProjectScaffoldFlow from './components/01-1-ProjectScaffoldFlow.vue'
import LocalhostVisualizer from './components/01-1-LocalhostVisualizer.vue'
// Chapter 03: PRD Doc-Driven
import PRDToCodeFlow from './components/03-4-PRDToCodeFlow.vue'
import SoulThreeQuestions from './components/03-1-SoulThreeQuestions.vue'
import AIConfirmationDemo from './components/03-2-AIConfirmationDemo.vue'
import PRDIterationTimeline from './components/03-3-PRDIterationTimeline.vue'
import InterviewSimulator from './components/03-1-InterviewSimulator.vue'
import GoodBadPRDCompare from './components/03-3-GoodBadPRDCompare.vue'
import ConfirmationChecklist from './components/03-2-ConfirmationChecklist.vue'
// Chapter 05: UI/UX
import DesignToolWorkflow from './components/05-1-DesignToolWorkflow.vue'
import LibraryDecisionTree from './components/05-2-LibraryDecisionTree.vue'
import AnimationDecisionTree from './components/05-3-AnimationDecisionTree.vue'
import StyleShowcase from './components/05-4-StyleShowcase.vue'
import AdvancedEffects from './components/05-5-AdvancedEffects.vue'
import ScrollEffects from './components/05-5-ScrollEffects.vue'
import TransitionEffects from './components/05-5-TransitionEffects.vue'
import VisualEffects from './components/05-5-VisualEffects.vue'
import InteractionEffects from './components/05-5-InteractionEffects.vue'
import ButtonEffects from './components/05-5-ButtonEffects.vue'
// Chapter 04: Dev Fundamentals
import BuildModesSimulator from './components/04-0-BuildModesSimulator.vue'
import TechStackDecisionTree from './components/04-1-TechStackDecisionTree.vue'
import CodeConceptVisualizer from './components/04-3-CodeConceptVisualizer.vue'
import HttpRequestFlow from './components/04-4-HttpRequestFlow.vue'
import StatusCodeExplorer from './components/04-4-StatusCodeExplorer.vue'
import FrontendBackendArchitecture from './components/04-5-FrontendBackendArchitecture.vue'
import ConfigFormatPlayground from './components/04-6-ConfigFormatPlayground.vue'
import ApiIntegrationFlow from './components/04-7-ApiIntegrationFlow.vue'
// Chapter 02: AI Tuning Guide
import TokenCalculator from './components/02-1-TokenCalculator.vue'
import WorkflowStepper from './components/02-2-WorkflowStepper.vue'
import PermissionModeSwitcher from './components/02-2-PermissionModeSwitcher.vue'
import MCPDecisionTree from './components/02-3-MCPDecisionTree.vue'
import PromptOptimizer from './components/02-5-PromptOptimizer.vue'
// Chapter 06: Database
import DatabaseVisualizer from './components/06-2-DatabaseVisualizer.vue'
import StorageEvolution from './components/06-1-StorageEvolution.vue'
import CRUDVisualizer from './components/06-3-CRUDVisualizer.vue'
import OptimizationVisualizer from './components/06-4-OptimizationVisualizer.vue'
// Chapter 07: Backend API
import FullStackFlow from './components/07-0-FullStackFlow.vue'
import ApiEvolution from './components/07-1-ApiEvolution.vue'
import ErrorHandling from './components/07-2-ErrorHandling.vue'
import RealtimeComparison from './components/07-3-RealtimeComparison.vue'
// Chapter 08: Auth & Security
import AuthFlow from './components/08-0-AuthFlow.vue'
import SecurityBoundary from './components/08-0-SecurityBoundary.vue'
import EnvBoundary from './components/08-1-EnvBoundary.vue'
import AuthMethodComparison from './components/08-2-AuthMethodComparison.vue'
import MiddlewareFlow from './components/08-3-MiddlewareFlow.vue'
import AttackVisualizer from './components/08-5-AttackVisualizer.vue'
// Chapter 04: Additional components
import ScaleComparison from './components/04-1-ScaleComparison.vue'
import CompileVsInterpret from './components/04-2-CompileVsInterpret.vue'
import DataModelER from './components/04-2-DataModelER.vue'
import SearchComparison from './components/04-3-SearchComparison.vue'
import PseudocodeTransform from './components/04-3-PseudocodeTransform.vue'
import ProxyArchitecture from './components/04-7-ProxyArchitecture.vue'
// Chapter 05: Additional components
import MotionEffectsDemo from './components/05-3-MotionEffectsDemo.vue'
// Chapter 09: Testing & Automation
import TestPyramid from './components/09-1-TestPyramid.vue'
import TestCoverage from './components/09-2-TestCoverage.vue'
import CIWorkflow from './components/09-3-CIWorkflow.vue'
// Chapter 15: SEO & Analytics
import OGCardPreview from './components/15-1-OGCardPreview.vue'

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
    app.component('PackageManagerCompare', PackageManagerCompare)
    app.component('PackageJsonExplorer', PackageJsonExplorer)
    app.component('AIToolSelector', AIToolSelector)
    app.component('ProjectScaffoldFlow', ProjectScaffoldFlow)
    app.component('LocalhostVisualizer', LocalhostVisualizer)
    app.component('AdvancedEffects', AdvancedEffects)
    app.component('ScrollEffects', ScrollEffects)
    app.component('TransitionEffects', TransitionEffects)
    app.component('VisualEffects', VisualEffects)
    app.component('InteractionEffects', InteractionEffects)
    app.component('ButtonEffects', ButtonEffects)
    app.component('DesignToolWorkflow', DesignToolWorkflow)
    app.component('LibraryDecisionTree', LibraryDecisionTree)
    app.component('AnimationDecisionTree', AnimationDecisionTree)
    app.component('StyleShowcase', StyleShowcase)
    app.component('PRDToCodeFlow', PRDToCodeFlow)
    app.component('SoulThreeQuestions', SoulThreeQuestions)
    app.component('AIConfirmationDemo', AIConfirmationDemo)
    app.component('PRDIterationTimeline', PRDIterationTimeline)
    app.component('InterviewSimulator', InterviewSimulator)
    app.component('GoodBadPRDCompare', GoodBadPRDCompare)
    app.component('ConfirmationChecklist', ConfirmationChecklist)
    app.component('TokenCalculator', TokenCalculator)
    app.component('WorkflowStepper', WorkflowStepper)
    app.component('PermissionModeSwitcher', PermissionModeSwitcher)
    app.component('MCPDecisionTree', MCPDecisionTree)
    app.component('PromptOptimizer', PromptOptimizer)
    // Chapter 04
    app.component('BuildModesSimulator', BuildModesSimulator)
    app.component('TechStackDecisionTree', TechStackDecisionTree)
    app.component('CodeConceptVisualizer', CodeConceptVisualizer)
    app.component('HttpRequestFlow', HttpRequestFlow)
    app.component('StatusCodeExplorer', StatusCodeExplorer)
    app.component('FrontendBackendArchitecture', FrontendBackendArchitecture)
    app.component('ConfigFormatPlayground', ConfigFormatPlayground)
    app.component('ApiIntegrationFlow', ApiIntegrationFlow)
    app.component('DatabaseVisualizer', DatabaseVisualizer)
    app.component('StorageEvolution', StorageEvolution)
    app.component('CRUDVisualizer', CRUDVisualizer)
    app.component('OptimizationVisualizer', OptimizationVisualizer)
    // Chapter 07
    app.component('FullStackFlow', FullStackFlow)
    app.component('ApiEvolution', ApiEvolution)
    app.component('ErrorHandling', ErrorHandling)
    app.component('RealtimeComparison', RealtimeComparison)
    // Chapter 08
    app.component('AuthFlow', AuthFlow)
    app.component('SecurityBoundary', SecurityBoundary)
    app.component('EnvBoundary', EnvBoundary)
    app.component('AuthMethodComparison', AuthMethodComparison)
    app.component('MiddlewareFlow', MiddlewareFlow)
    app.component('AttackVisualizer', AttackVisualizer)
    // Chapter 04 (additional)
    app.component('ScaleComparison', ScaleComparison)
    app.component('CompileVsInterpret', CompileVsInterpret)
    app.component('DataModelER', DataModelER)
    app.component('SearchComparison', SearchComparison)
    app.component('PseudocodeTransform', PseudocodeTransform)
    app.component('ProxyArchitecture', ProxyArchitecture)
    // Chapter 05 (additional)
    app.component('MotionEffectsDemo', MotionEffectsDemo)
    // Chapter 09
    app.component('TestPyramid', TestPyramid)
    app.component('TestCoverage', TestCoverage)
    app.component('CIWorkflow', CIWorkflow)
    // Chapter 15
    app.component('OGCardPreview', OGCardPreview)
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
