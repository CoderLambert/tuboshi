export function cleanUpSvgCode(svgCode: string): string {
  return svgCode.replaceAll('<br>', '<br/>')
}

/**
 * Converts SVG to base64 string for image rendering
 */
export function svgToBase64(svgGraph: string): Promise<string> {
  if (!svgGraph)
    return Promise.resolve('')

  try {
    // Ensure SVG has correct XML declaration
    if (!svgGraph.includes('<?xml'))
      svgGraph = `<?xml version="1.0" encoding="UTF-8"?>${svgGraph}`

    const blob = new Blob([new TextEncoder().encode(svgGraph)], { type: 'image/svg+xml;charset=utf-8' })
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  catch (error) {
    console.error('Error converting SVG to base64:', error)
    return Promise.resolve('')
  }
}



/**
 * Checks if mermaid code is complete and valid
 */
export function isMermaidCodeComplete(code: string): boolean {
  if (!code || code.trim().length === 0)
    return false

  try {
    const trimmedCode = code.trim()

    // Special handling for gantt charts
    if (trimmedCode.startsWith('gantt')) {
      // For gantt charts, check if it has at least a title and one task
      const lines = trimmedCode.split('\n').filter(line => line.trim().length > 0)
      return lines.length >= 3
    }

    // Check for basic syntax structure
    const hasValidStart = /^(graph|flowchart|sequenceDiagram|classDiagram|classDef|class|stateDiagram|gantt|pie|er|journey|requirementDiagram)/.test(trimmedCode)

    // Check for balanced brackets and parentheses
    const isBalanced = (() => {
      const stack = []
      const pairs = { '{': '}', '[': ']', '(': ')' }

      for (const char of trimmedCode) {
        if (char in pairs) {
          stack.push(char)
        }
        else if (Object.values(pairs).includes(char)) {
          const last = stack.pop()
          if (pairs[last as keyof typeof pairs] !== char)
            return false
        }
      }

      return stack.length === 0
    })()

    // Check for common syntax errors
    const hasNoSyntaxErrors = !trimmedCode.includes('undefined')
      && !trimmedCode.includes('[object Object]')
      && trimmedCode.split('\n').every(line =>
        !(line.includes('-->') && !line.match(/\S+\s*-->\s*\S+/)))

    return hasValidStart && isBalanced && hasNoSyntaxErrors
  }
  catch (error) {
    console.debug('Mermaid code validation error:', error)
    return false
  }
}

/**
 * Helper to wait for DOM element with retry mechanism
 */
export function waitForDOMElement(callback: () => Promise<any>, maxAttempts = 3, delay = 100): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const tryRender = async () => {
      try {
        resolve(await callback())
      }
      catch (error) {
        attempts++
        if (attempts < maxAttempts)
          setTimeout(tryRender, delay)
        else
          reject(error)
      }
    }
    tryRender()
  })
}
