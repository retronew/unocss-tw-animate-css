import type { Rule } from '@unocss/core'
import { definePreset } from '@unocss/core'

const REGEX_PATTERNS = {
  number: /^(\[?(\d+(?:\.\d+)?|\d*\.\d+)\]?)$/,
  percentage: /^(\[?(\d+(?:\.\d+)?%)\]?)$/,
  ratio: /^(\[?(\d+\/\d+)\]?)$/,
  degree: /^(\[?(\d+(?:\.\d+)?deg)\]?)$/,
} as const

const extractValue = (match: RegExpMatchArray): string => match[2] || match[1]

function createValueParser(patterns: Array<{
  regex: RegExp
  transform: (value: string, coefficient: number) => string
}>) {
  return (value: string, coefficient = 1): string | null => {
    for (const { regex, transform } of patterns) {
      const match = value.match(regex)
      if (match) {
        const actualValue = extractValue(match)
        return transform(actualValue, coefficient)
      }
    }
    return null
  }
}

// Opacity value parser
const parseOpacityValue = createValueParser([
  {
    regex: REGEX_PATTERNS.number,
    transform: value => `calc(${value} / 100)`,
  },
  {
    regex: REGEX_PATTERNS.ratio,
    transform: value => value,
  },
  {
    regex: REGEX_PATTERNS.percentage,
    transform: value => value,
  },
])

// Scale value parser
const parseScaleValue = createValueParser([
  {
    regex: REGEX_PATTERNS.number,
    transform: (value, coefficient) => `calc(${value} * ${coefficient}%)`,
  },
  {
    regex: REGEX_PATTERNS.ratio,
    transform: (value, coefficient) => `calc(${value} * ${coefficient})`,
  },
  {
    regex: REGEX_PATTERNS.percentage,
    transform: (value, coefficient) => `calc(${value} * ${coefficient})`,
  },
])

// Rotate value parser
const parseRotateValue = createValueParser([
  {
    regex: REGEX_PATTERNS.number,
    transform: (value, coefficient) => `calc(${value} * ${coefficient}deg)`,
  },
  {
    regex: REGEX_PATTERNS.degree,
    transform: (value, coefficient) => `calc(${value} * ${coefficient})`,
  },
  {
    regex: REGEX_PATTERNS.ratio,
    transform: (value, coefficient) => `calc(${value} * ${coefficient} * 360deg)`,
  },
  {
    regex: REGEX_PATTERNS.percentage,
    transform: (value, coefficient) => `calc(${value} * ${coefficient} * 360deg)`,
  },
])

// Translate value parser
const parseTranslateValue = createValueParser([
  {
    regex: REGEX_PATTERNS.number,
    transform: (value, coefficient) => `calc(var(--spacing) * ${value} * ${coefficient})`,
  },
  {
    regex: REGEX_PATTERNS.ratio,
    transform: (value, coefficient) => `calc(${value} * ${coefficient * 100}%)`,
  },
  {
    regex: REGEX_PATTERNS.percentage,
    transform: (value, coefficient) => `calc(${value} * ${coefficient * 100}%)`,
  },
])

function getAnimationCSS() {
  return `
  :root {
    /* Animation variables for enter/exit effects */
    --un-enter-opacity: 1;
    --un-enter-rotate: 0;
    --un-enter-scale: 1;
    --un-enter-translate-x: 0;
    --un-enter-translate-y: 0;
    --un-exit-opacity: 1;
    --un-exit-rotate: 0;
    --un-exit-scale: 1;
    --un-exit-translate-x: 0;
    --un-exit-translate-y: 0;
  }

  @keyframes enter {
    from {
      opacity: var(--un-enter-opacity, 1);
      transform: translate3d(var(--un-enter-translate-x, 0), var(--un-enter-translate-y, 0), 0)
        scale3d(var(--un-enter-scale, 1), var(--un-enter-scale, 1), var(--un-enter-scale, 1))
        rotate(var(--un-enter-rotate, 0));
    }
  }

  @keyframes exit {
    to {
      opacity: var(--un-exit-opacity, 1);
      transform: translate3d(var(--un-exit-translate-x, 0), var(--un-exit-translate-y, 0), 0)
        scale3d(var(--un-exit-scale, 1), var(--un-exit-scale, 1), var(--un-exit-scale, 1))
        rotate(var(--un-exit-rotate, 0));
    }
  }

  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--reka-accordion-content-height, var(--kb-accordion-content-height, auto)); }
  }

  @keyframes accordion-up {
    from { height: var(--reka-accordion-content-height, var(--kb-accordion-content-height, auto)); }
    to { height: 0; }
  }

  @keyframes collapsible-down {
    from { height: 0; }
    to { height: var(--reka-collapsible-content-height, var(--kb-collapsible-content-height, auto)); }
  }

  @keyframes collapsible-up {
    from { height: var(--reka-collapsible-content-height, var(--kb-collapsible-content-height, auto)); }
    to { height: 0; }
  }

  @keyframes caret-blink {
    0%, 70%, 100% { opacity: 1; }
    20%, 50% { opacity: 0; }
  }
`
}

function getBaseAnimationRules(): Rule[] {
  return [
    ['animate-in', {
      animation: 'enter var(--un-animation-duration,var(--un-duration,150ms)) var(--un-ease,ease) var(--un-animation-delay,0s) var(--un-animation-iteration-count,1) var(--un-animation-direction,normal) var(--un-animation-fill-mode,none)',
    }],
    ['animate-out', {
      animation: 'exit var(--un-animation-duration,var(--un-duration,150ms)) var(--un-ease,ease) var(--un-animation-delay,0s) var(--un-animation-iteration-count,1) var(--un-animation-direction,normal) var(--un-animation-fill-mode,none)',
    }],
    ['animate-accordion-down', {
      animation: 'accordion-down var(--un-animation-duration,var(--un-duration,200ms)) ease-out',
    }],
    ['animate-accordion-up', {
      animation: 'accordion-up var(--un-animation-duration,var(--un-duration,200ms)) ease-out',
    }],
    ['animate-collapsible-down', {
      animation: 'collapsible-down var(--un-animation-duration,var(--un-duration,200ms)) ease-out',
    }],
    ['animate-collapsible-up', {
      animation: 'collapsible-up var(--un-animation-duration,var(--un-duration,200ms)) ease-out',
    }],
    ['animate-caret-blink', {
      animation: 'caret-blink 1.25s ease-out infinite',
    }],
  ] as const
}

// Fade rules
function getFadeRules(): Rule[] {
  return [
    // Fade in
    ['fade-in', { '--un-enter-opacity': '0' }],
    [/^fade-in-(.+)$/, ([, n]) => {
      const opacity = parseOpacityValue(n)
      return opacity ? { '--un-enter-opacity': opacity } : undefined
    }, { autocomplete: [
      'fade-in-<num>',
      'fade-in-[<num>]',
      'fade-in-<percent>',
      'fade-in-[<percent>]',
    ] }],

    // Fade out
    ['fade-out', { '--un-exit-opacity': '0' }],
    [/^fade-out-(.+)$/, ([, n]) => {
      const opacity = parseOpacityValue(n)
      return opacity ? { '--un-exit-opacity': opacity } : undefined
    }, { autocomplete: [
      'fade-out-<num>',
      'fade-out-[<num>]',
      'fade-out-<percent>',
      'fade-out-[<percent>]',
    ] }],
  ] as const
}

// Zoom rules
function getZoomRules(): Rule[] {
  return [
  // Zoom in
    ['zoom-in', { '--un-enter-scale': '0' }],
    [/^(-?)zoom-in-(.+)$/, ([, sign, n]) => {
      const coefficient = sign === '-' ? -1 : 1
      const scale = parseScaleValue(n, coefficient)
      return scale ? { '--un-enter-scale': scale } : undefined
    }, { autocomplete: [
      'zoom-in-<num>',
      'zoom-in-[<num>]',
      'zoom-in-<percent>',
      'zoom-in-[<percent>]',
    ] }],

    // Zoom out
    ['zoom-out', { '--un-exit-scale': '0' }],
    [/^(-?)zoom-out-(.+)$/, ([, sign, n]) => {
      const coefficient = sign === '-' ? -1 : 1
      const scale = parseScaleValue(n, coefficient)
      return scale ? { '--un-exit-scale': scale } : undefined
    }, { autocomplete: [
      'zoom-out-<num>',
      'zoom-out-[<num>]',
      'zoom-out-<percent>',
      'zoom-out-[<percent>]',
    ] }],
  ] as const
}

// Spin rules
function getSpinRules(): Rule[] {
  return [
  // Spin in
    [/^(-?)spin-in$/, ([, sign]) => {
      const coefficient = sign === '-' ? -1 : 1
      return { '--un-enter-rotate': `${coefficient * 30}deg` }
    }, {
      autocomplete: [
        'spin-in',
        '-spin-in',
      ],
    }],
    [/^(-?)spin-in-(.+)$/, ([, sign, n]) => {
      const coefficient = sign === '-' ? -1 : 1
      const rotate = parseRotateValue(n, coefficient)
      return rotate ? { '--un-enter-rotate': rotate } : undefined
    }, { autocomplete: [
      'spin-in-<num>',
      'spin-in-[<num>]',
      'spin-in-<num>deg',
      'spin-in-[<num>deg]',
      'spin-in-<percent>',
      'spin-in-[<percent>]',
    ] }],

    // Spin out
    [/^(-?)spin-out$/, ([, sign]) => {
      const coefficient = sign === '-' ? -1 : 1
      return { '--un-exit-rotate': `${coefficient * 30}deg` }
    }, {
      autocomplete: [
        'spin-out',
        '-spin-out',
      ],
    }],
    [/^(-?)spin-out-(.+)$/, ([, sign, n]) => {
      const coefficient = sign === '-' ? -1 : 1
      const rotate = parseRotateValue(n, coefficient)
      return rotate ? { '--un-exit-rotate': rotate } : undefined
    }, { autocomplete: [
      'spin-out-<num>',
      'spin-out-[<num>]',
      'spin-out-<num>deg',
      'spin-out-[<num>deg]',
      'spin-out-<percent>',
      'spin-out-[<percent>]',
    ] }],
  ] as const
}

// Slide rules
function createSlideRules(type: 'in' | 'out'): Rule[] {
  const prefix = type === 'in' ? 'slide-in-from' : 'slide-out-to'
  const cssVar = type === 'in' ? '--un-enter-translate' : '--un-exit-translate'

  return [
    // Vertical direction (top/bottom)
    [new RegExp(`^${prefix}-(top|bottom)$`), ([, direction]) => {
      const coefficient = direction === 'top' ? -1 : 1
      return { [`${cssVar}-y`]: `${coefficient * 100}%` }
    }, {
      autocomplete: [
        `${prefix}-(top|bottom)`,
      ],
    }],
    [new RegExp(`^${prefix}-(top|bottom)-(.+)$`), ([, direction, n]) => {
      const coefficient = direction === 'top' ? -1 : 1
      const translate = parseTranslateValue(n, coefficient)
      return translate ? { [`${cssVar}-y`]: translate } : undefined
    }, {
      autocomplete: [
        `${prefix}-(top|bottom)-<num>`,
        `${prefix}-(top|bottom)-[<num>]`,
        `${prefix}-(top|bottom)-<percent>`,
        `${prefix}-(top|bottom)-[<percent>]`,
      ],
    }],

    // Horizontal direction (left/right)
    [new RegExp(`^${prefix}-(left|right)$`), ([, direction]) => {
      const coefficient = direction === 'left' ? -1 : 1
      return { [`${cssVar}-x`]: `${coefficient * 100}%` }
    }, {
      autocomplete: [
        `${prefix}-(left|right)`,
      ],
    }],
    [new RegExp(`^${prefix}-(left|right)-(.+)$`), ([, direction, n]) => {
      const coefficient = direction === 'left' ? -1 : 1
      const translate = parseTranslateValue(n, coefficient)
      return translate ? { [`${cssVar}-x`]: translate } : undefined
    }, {
      autocomplete: [
        `${prefix}-(left|right)-<num>`,
        `${prefix}-(left|right)-[<num>]`,
        `${prefix}-(left|right)-<percent>`,
        `${prefix}-(left|right)-[<percent>]`,
      ],
    }],

    // Logical direction (start/end)
    [new RegExp(`^${prefix}-(start|end)$`), ([, direction]) => {
      const coefficient = direction === 'start' ? -1 : 1
      return { [`${cssVar}-x`]: `${coefficient * 100}%` }
    }, {
      autocomplete: [
        `${prefix}-(start|end)`,
      ],
    }],
    [new RegExp(`^${prefix}-(start|end)-(\\d+)$`), ([, direction, n]) => {
      const coefficient = direction === 'start' ? -1 : 1
      const translate = parseTranslateValue(n, coefficient)
      return translate ? { [`${cssVar}-x`]: translate } : undefined
    }, {
      autocomplete: [
        `${prefix}-(start|end)-<num>`,
        `${prefix}-(start|end)-[<num>]`,
        `${prefix}-(start|end)-<percent>`,
        `${prefix}-(start|end)-[<percent>]`,
      ],
    }],
  ] as const
}

export default definePreset(() => {
  return {
    name: 'tw-animate',
    preflights: [
      {
        getCSS: getAnimationCSS,
      },
    ],
    rules: [
      ...getBaseAnimationRules(),
      ...getFadeRules(),
      ...getZoomRules(),
      ...getSpinRules(),
      ...createSlideRules('in'),
      ...createSlideRules('out'),
    ],
  }
})
