export default `.pf-v6-c-spinner {
  --pf-v6-c-spinner--diameter: var(--pf-t--global--icon--size--2xl, 2.5rem);
  --pf-v6-c-spinner--Width: var(--pf-v6-c-spinner--diameter);
  --pf-v6-c-spinner--Height: var(--pf-v6-c-spinner--diameter);
  --pf-v6-c-spinner--Color: var(--pf-t--global--icon--color--brand--default);
  --pf-v6-c-spinner--AnimationDuration: 1.4s;
  --pf-v6-c-spinner--AnimationTimingFunction: linear;
  --pf-v6-c-spinner--StrokeWidth: 10;
  --pf-v6-c-spinner__path--StrokeWidth: var(--pf-v6-c-spinner--StrokeWidth);
  --pf-v6-c-spinner__path--AnimationTimingFunction: ease-in-out;
  --pf-v6-c-spinner--m-xs--diameter: var(--pf-t--global--icon--size--sm);
  --pf-v6-c-spinner--m-sm--diameter: var(--pf-t--global--icon--size--md);
  --pf-v6-c-spinner--m-md--diameter: var(--pf-t--global--icon--size--lg, 1.5rem);
  --pf-v6-c-spinner--m-lg--diameter: var(--pf-t--global--icon--size--xl);
  --pf-v6-c-spinner--m-xl--diameter: var(--pf-t--global--icon--size--2xl);
  --pf-v6-c-spinner--m-inline--diameter: 1em;
}

.pf-v6-c-spinner {
  display: block;
  width: var(--pf-v6-c-spinner--Width);
  height: var(--pf-v6-c-spinner--Height);
  overflow: hidden;
  animation: pf-v6-c-spinner-animation-rotate calc(var(--pf-v6-c-spinner--AnimationDuration) * 2) var(--pf-v6-c-spinner--AnimationTimingFunction) infinite;
}
.pf-v6-c-spinner.pf-m-inline {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-inline--diameter);
}
.pf-v6-c-spinner.pf-m-xs {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-xs--diameter);
  --pf-v6-c-spinner--StrokeWidth: 15;
}
.pf-v6-c-spinner.pf-m-sm {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-sm--diameter);
}
.pf-v6-c-spinner.pf-m-md {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-md--diameter);
}
.pf-v6-c-spinner.pf-m-lg {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-lg--diameter);
}
.pf-v6-c-spinner.pf-m-xl {
  --pf-v6-c-spinner--diameter: var(--pf-v6-c-spinner--m-xl--diameter);
}
.pf-v6-m-no-motion .pf-v6-c-spinner {
  --pf-v6-c-spinner--AnimationDuration: 0s;
}

.pf-v6-c-spinner__path {
  width: 100%;
  height: 100%;
  stroke: var(--pf-v6-c-spinner--Color);
  stroke-width: var(--pf-v6-c-spinner--StrokeWidth);
  stroke-linecap: round;
  stroke-dasharray: 283;
  stroke-dashoffset: 280;
  transform-origin: 50% 50%;
  animation: pf-v6-c-spinner-animation-dash var(--pf-v6-c-spinner--AnimationDuration) var(--pf-v6-c-spinner__path--AnimationTimingFunction) infinite;
}

.pf-v6-c-button__progress .pf-v6-c-spinner {
  --pf-v6-c-spinner--Color: currentcolor;
}

.pf-v6-c-button {
  position: relative;
}

.pf-v6-c-button__progress {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: var(--pf-t--global--spacer--control--horizontal--default, 1rem);
  line-height: 1;
  color: currentcolor;
  transform: translateY(-50%);
  z-index: 1;
}

.pf-v6-c-button.pf-m-in-progress.pf-m-plain .pf-v6-c-button__progress {
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}

.pf-v6-c-button.pf-m-in-progress.pf-m-plain > :not(.pf-v6-c-button__progress) {
  opacity: 0;
}

@keyframes pf-v6-c-spinner-animation-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pf-v6-c-spinner-animation-dash {
  0% {
    stroke-dashoffset: 280;
    transform: rotate(0);
  }
  15% {
    stroke-width: calc(var(--pf-v6-c-spinner__path--StrokeWidth) - 4);
  }
  40% {
    stroke-dasharray: 220;
    stroke-dashoffset: 150;
  }
  100% {
    stroke-dashoffset: 280;
    transform: rotate(720deg);
  }
}`;
