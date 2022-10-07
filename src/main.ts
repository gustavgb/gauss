import katex from 'katex'

/*
Has solution:
5,-3,2,1
-1,3,0,-1
3,2,2,0
2,0,3,8

2,1,-3,-5
1,0.5,2,4.5
7,-2,3,37

No solution:
2,-3,-1,3
0,4,-3,-1
-3,1,2,-1
1,-4,-5,-1

Infinite solutions:
1,1,-1,1
3,-1,5,3
7,2,3,7
*/

type Mode = 'plain' | 'latex' | 'code'

let matrix: number[][] = []
let result: string[] = []
let mode: Mode = 'latex'

const output: HTMLParagraphElement = document.getElementById('result') as HTMLParagraphElement
const input: HTMLTextAreaElement = document.getElementById('equations') as HTMLTextAreaElement
const modeSelect: HTMLSelectElement = document.getElementById('mode') as HTMLSelectElement

function initiateAll() {
  matrix = input.value
    .split('\n')
    .filter(Boolean)
    .map((row) => row.split(',').map((str) => parseFloat(str)))

  result = []

  mode = modeSelect.value as Mode
}

function printResult() {
  if (mode === 'plain' || mode === 'code') {
    output.innerText = result.join('\n')
  } else if (mode === 'latex') {
    katex.render(result.join('\n'), output, {
      throwOnError: true,
      output: 'html',
      displayMode: true,
      strict: false,
      fleqn: true
    })
  }
}

function pushStep(message: string, helpTexts: string[] = []) {
  if (mode === 'plain') {
    const mapped = matrix.map((row, rowIndex) =>
      [
        helpTexts[rowIndex],
        ...row.map((cell) => (Math.floor(cell * 1000) / 1000).toString())
      ].filter(Boolean)
    )
    const columnWidths = mapped[0].map((_, col) =>
      Math.max(...mapped.map((row) => row[col].length))
    )
    result.push(
      `${message}\n${mapped
        .map((row) =>
          row
            .map((cell, colIndex) => {
              const spaces = []
              for (let i = 0; i < columnWidths[colIndex] - cell.length; i++) {
                spaces.push(' ')
              }

              return spaces.join('') + cell
            })
            .join('  ')
        )
        .join('\n')}\n`
    )
  } else if (mode === 'latex' || mode === 'code') {
    result.push(
      `\\text{${message}}\n\\\\[0.05in]\n${
        helpTexts.length > 0
          ? `\\begin{equation*}\n\\begin{matrix*}[r]\n${helpTexts.join(
              '\\\\\n'
            )}\n\\end{matrix*}\n\\quad\n`
          : ''
      }\\begin{bmatrix}\n${matrix.map((row) => row.join(' & ')).join('\\\\\n')}\n\\end{bmatrix}\n${
        helpTexts.length > 0 ? `\\end{equation*}\n` : ''
      }\\\\[.1in]\n`
    )
  }
}

function pushError(message: string) {
  result.push(message)
}

function transformMatrix() {
  // Elimination
  const steps = matrix[0].length - 1
  for (let step = 0; step < steps; step++) {
    if (matrix[step][step] === 0) {
      // Find row to swap with
      let swapIndex = -1
      for (let i = step + 1; i < matrix[step].length; i++) {
        if (matrix[i][step] !== 0) {
          swapIndex = i
          break
        }
      }

      if (swapIndex === -1) {
        continue
      }

      const temp = matrix[step]
      matrix[step] = matrix[swapIndex]
      matrix[swapIndex] = temp
      pushStep(`Swap R${step + 1} with R${swapIndex + 1}.`)
    }

    let shouldEliminate = false
    for (let i = step + 1; i < matrix.length; i++) {
      if (matrix[i][step] !== 0) {
        shouldEliminate = true
        break
      }
    }

    const helpTexts = []
    for (let i = 0; i <= step; i++) {
      helpTexts.push(' ')
    }

    if (shouldEliminate) {
      // Eliminate column
      for (let row = step + 1; row < matrix.length; row++) {
        const multiplyTargetBy = matrix[step][step]
        const multiplySourceBy = matrix[row][step]
        if (multiplySourceBy === 0) {
          helpTexts.push(' ')
          continue
        }

        matrix[row] = matrix[row].map((cell, col) => {
          return cell * multiplyTargetBy - multiplySourceBy * matrix[step][col]
        })
        helpTexts.push(
          `${multiplyTargetBy !== 1 ? multiplyTargetBy : ''}R${row + 1} ${
            multiplySourceBy >= 0 ? '-' : '+'
          } ${Math.abs(multiplySourceBy) !== 1 ? Math.abs(multiplySourceBy) : ''}R${step + 1}${
            mode === 'plain' ? '  ' : ''
          }`
        )
      }
      pushStep(`Use R${step + 1} to eliminate column.`, helpTexts)
    }
  }

  // No solution
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i]
    const rightSum = row[row.length - 1]
    const leftSum = matrix[i]
      .slice(0, matrix[i].length - 1)
      .reduce((sum, cell) => sum + Math.abs(cell), 0)
    if (rightSum !== 0 && leftSum === 0) {
      pushError('No solution')
      return
    }
  }

  // Infinite solutions
  const notZeroRows = matrix.filter((row) => row.some((cell) => !!cell)).length
  if (notZeroRows < matrix[0].length - 1) {
    pushError('Infinite solutions')
    return
  }
}

window.calculate = function calculate() {
  initiateAll()
  transformMatrix()
  printResult()
}

window.addEventListener('DOMContentLoaded', () => {
  calculate()
})
