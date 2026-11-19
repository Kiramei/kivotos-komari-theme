<script setup lang="ts">
import type { NodeData } from '@/stores/nodes'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GloriaWorldMap from '@/components/GloriaWorldMap.vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ nodes?: NodeData[] }>()
const appStore = useAppStore()
const easterActive = ref(false)
const easterVariant = ref<'reflection' | 'wedding'>('wedding')
let easterTimer: ReturnType<typeof setTimeout> | null = null
const isReflectionEaster = computed(() => easterVariant.value === 'reflection')
const easterSource = computed(() => appStore.gloriaHeroUrl)
const easterType = computed(() => appStore.gloriaHeroUrl ? appStore.gloriaHeroType : 'image')
const easterAlt = '彩蛋背景'
const easterMessage = computed(() => isReflectionEaster.value ? '老师，欢迎回来！' : appStore.easterTitle || '全员集合，出发！')
const easterSub = computed(() => isReflectionEaster.value ? 'WELCOME BACK, SENSEI' : appStore.easterSubtitle || 'ALL STUDENTS, ASSEMBLE')

function revealEasterEgg(event?: Event): void {
  const detail = event instanceof CustomEvent ? event.detail as { variant?: string } | undefined : undefined
  easterVariant.value = detail?.variant === 'reflection' ? 'reflection' : 'wedding'
  easterActive.value = false
  requestAnimationFrame(() => easterActive.value = true)
  if (easterTimer)
    clearTimeout(easterTimer)
  easterTimer = setTimeout(() => easterActive.value = false, 6200)
}

onMounted(() => window.addEventListener('gloria:easter-egg', revealEasterEgg))
onBeforeUnmount(() => {
  window.removeEventListener('gloria:easter-egg', revealEasterEgg)
  if (easterTimer)
    clearTimeout(easterTimer)
})
</script>

<template>
  <section class="gloria-stage" aria-label="基沃托斯节点地图">
    <GloriaWorldMap :nodes="props.nodes" :paused="appStore.stopEarth" />
    <button type="button" data-gloria-easter-trigger="wedding" class="gloria-stage__egg" title="全员集合" aria-label="全员集合彩蛋" @click="revealEasterEgg">
      <span class="gloria-stage__halo" aria-hidden="true" /><small>{{ appStore.easterButtonLabel || 'ASSEMBLE' }}</small>
    </button>

    <Teleport to="body">
      <Transition name="gloria-awakening">
        <button v-if="easterActive" type="button" class="gloria-easter" aria-label="关闭彩蛋" @click="easterActive = false">
          <template v-if="easterSource">
            <video v-if="easterType === 'video'" class="gloria-easter__backdrop" :src="easterSource" autoplay muted loop playsinline />
            <img v-else class="gloria-easter__backdrop" :src="easterSource" :alt="easterAlt">
          </template>
          <span v-else class="gloria-easter__sky" aria-hidden="true" />
          <span class="gloria-easter__veil" aria-hidden="true" />
          <span class="gloria-easter__content">
            <span v-if="!easterSource" class="gloria-easter__gem" aria-hidden="true"><i /></span>
            <small>{{ easterSub }}</small>
            <strong :class="{ 'gloria-easter__message--reflection': isReflectionEaster }">{{ easterMessage }}</strong>
            <em>SCHALE · KIVOTOS</em>
          </span>
        </button>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gloria-stage {
  position: relative;
  isolation: isolate;
  min-height: 16.5rem;
  overflow: hidden;
  border: 1px solid rgb(47 156 255 / 0.24);
  border-radius: 1.1rem;
  background: #07142b;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.06),
    0 18px 48px rgb(0 0 0 / 0.24);
}

:global(:root:not(.dark) .gloria-stage) {
  border-color: rgb(255 255 255 / 0.88);
  background: rgb(255 255 255 / 0.76);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.94),
    0 16px 40px rgb(18 92 180 / 0.14),
    0 5px 20px rgb(14 165 233 / 0.08);
}
.gloria-stage__egg {
  position: absolute;
  z-index: 6;
  top: 0.72rem;
  right: 0.78rem;
  display: grid;
  min-width: 4.25rem;
  place-items: center;
  border: 1px solid rgb(253 230 138 / 0.42);
  border-radius: 999px;
  background: rgb(8 19 42 / 0.72);
  padding: 0.32rem 0.52rem;
  color: #fde68a;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 18px rgb(255 143 184 / 0.18);
  isolation: isolate;
  transition:
    border-color 180ms ease,
    transform 180ms ease,
    background 180ms ease;
}
.gloria-stage__egg::before {
  position: absolute;
  z-index: -1;
  inset: -0.18rem;
  border: 1px solid rgb(253 230 138 / 0.64);
  border-radius: inherit;
  content: '';
  pointer-events: none;
  animation: gloria-egg-signal 2.8s ease-out infinite;
}
.gloria-stage__egg::after {
  position: absolute;
  top: -0.2rem;
  right: 0.22rem;
  color: #fff5bd;
  content: '✦';
  font-size: 0.48rem;
  pointer-events: none;
  text-shadow:
    0 0 9px #fde68a,
    0 0 16px #ff8fb8;
  animation: gloria-egg-spark 3.4s ease-in-out infinite;
}
.gloria-stage__egg:hover {
  border-color: rgb(253 230 138 / 0.9);
  background: rgb(16 34 66 / 0.86);
  transform: translateY(-1px) scale(1.04);
}
.gloria-stage__halo {
  display: block;
  width: 1.3rem;
  height: 0.48rem;
  border: 2px solid #ffd84a;
  border-radius: 50%;
  transform: rotate(-12deg);
  box-shadow: 0 0 10px rgb(255 216 74 / 0.7);
  animation: gloria-egg-beacon 2.8s ease-in-out infinite;
}
.gloria-stage__egg small {
  margin-top: 0.14rem;
  font-family: var(--font-display);
  font-size: 0.4rem;
  letter-spacing: 0.08em;
}

.gloria-easter {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  overflow: hidden;
  place-items: end center;
  border: 0;
  background: #040b1c;
  color: white;
  cursor: pointer;
}
.gloria-easter__backdrop,
.gloria-easter__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.gloria-easter__backdrop {
  object-fit: cover;
  object-position: center 30%;
  opacity: 1;
  animation: gloria-easter-camera 6.2s ease-out both;
}
.gloria-easter__veil {
  background:
    linear-gradient(0deg, rgb(4 11 28 / 0.85) 0%, rgb(4 11 28 / 0.4) 28%, transparent 50%);
}
.gloria-easter__sky {
  position: absolute;
  inset: 0;
  background: url('/images/kivotos/sky-dark.svg') center / cover no-repeat;
  animation: gloria-easter-camera 6.2s ease-out both;
}
.gloria-easter__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 1.5rem 1.5rem clamp(1.5rem, 5vh, 3.5rem);
  text-align: center;
  text-shadow:
    0 3px 24px #040b1c,
    0 0 34px #040b1c;
}
.gloria-easter__gem {
  display: block;
  width: clamp(8rem, 22vw, 15rem);
  height: clamp(2.6rem, 7vw, 4.8rem);
  border: clamp(5px, 1vw, 9px) solid #9be7ff;
  border-radius: 50%;
  box-shadow:
    0 0 24px #4dd6ff,
    0 0 60px rgb(18 138 250 / 0.8),
    inset 0 0 18px #4dd6ff;
  animation: gloria-gem-awaken 2.4s ease-in-out infinite;
}
.gloria-easter__gem i {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  outline: 2px dashed rgb(255 216 74 / 0.75);
  outline-offset: clamp(8px, 1.6vw, 16px);
}
.gloria-easter__content small {
  margin-top: 1rem;
  color: #9be9ff;
  font-family: var(--font-display);
  font-size: clamp(0.62rem, 1.5vw, 0.92rem);
  letter-spacing: 0.22em;
}
.gloria-easter__content strong {
  margin-top: 0.75rem;
  color: #fff7d6;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 7vw, 5.8rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-shadow:
    0 4px 26px #040b1c,
    0 0 26px rgb(253 230 138 / 0.66),
    0 0 64px rgb(56 160 255 / 0.74);
}
.gloria-easter__message--reflection {
  font-size: clamp(2.2rem, 5.6vw, 4.7rem) !important;
  letter-spacing: 0.08em !important;
}
.gloria-easter__content em {
  margin-top: 0.55rem;
  color: rgb(253 230 138 / 0.86);
  font-family: var(--font-display);
  font-size: clamp(0.62rem, 1.7vw, 1rem);
  font-style: normal;
  letter-spacing: 0.32em;
}
.gloria-easter__star {
  --angle: calc(var(--star-index) * 20deg);
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  width: 0.55rem;
  height: 0.55rem;
  background: hsl(calc(190 + var(--star-index) * 3) 95% 75%);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  animation: gloria-star-burst 2.8s calc(var(--star-index) * -75ms) ease-out infinite;
}
.gloria-awakening-enter-active,
.gloria-awakening-leave-active {
  transition: opacity 380ms ease;
}
.gloria-awakening-enter-from,
.gloria-awakening-leave-to {
  opacity: 0;
}
@keyframes gloria-easter-camera {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1.11);
  }
}
@keyframes gloria-egg-beacon {
  0%,
  100% {
    transform: rotate(-12deg) translateY(1px);
    opacity: 0.8;
  }
  50% {
    transform: rotate(-12deg) translateY(-2px);
    opacity: 1;
  }
}
@keyframes gloria-egg-signal {
  0% {
    opacity: 0.72;
    transform: scale(0.94);
  }
  72%,
  100% {
    opacity: 0;
    transform: scale(1.16, 1.34);
  }
}
@keyframes gloria-egg-spark {
  0%,
  34%,
  100% {
    opacity: 0.16;
    transform: translateY(1px) scale(0.72) rotate(0deg);
  }
  48% {
    opacity: 1;
    transform: translateY(-2px) scale(1.16) rotate(22deg);
  }
  62% {
    opacity: 0.34;
    transform: translateY(-4px) scale(0.84) rotate(42deg);
  }
}
@keyframes gloria-gem-awaken {
  0%,
  100% {
    transform: rotate(-10deg) translateY(4px);
    opacity: 0.82;
  }
  50% {
    transform: rotate(-10deg) translateY(-6px);
    opacity: 1;
  }
}
@keyframes gloria-star-burst {
  0% {
    transform: rotate(var(--angle)) translateX(1rem) scale(0);
    opacity: 0;
  }
  26% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateX(42vmin) scale(1.3);
    opacity: 0;
  }
}
@media (max-width: 767px) {
  .gloria-stage {
    min-height: 16.5rem;
  }
  .gloria-stage__egg {
    top: 0.62rem;
    right: 0.62rem;
  }
  .gloria-easter__backdrop {
    object-position: 50% 30%;
    opacity: 1;
  }
  .gloria-easter__content strong {
    letter-spacing: 0.07em;
  }
  .gloria-easter__message--reflection {
    font-size: clamp(2rem, 10vw, 2.7rem) !important;
    letter-spacing: 0.04em !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gloria-stage__egg::before,
  .gloria-stage__egg::after,
  .gloria-stage__egg span,
  .gloria-easter__backdrop,
  .gloria-easter__gem,
  .gloria-easter__star {
    animation: none;
  }
}
</style>
