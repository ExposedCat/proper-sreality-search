import {
  LlamaModel,
  LlamaContext,
  LlamaGrammarEvaluationState,
  LlamaGrammar
} from 'node-llama-cpp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

export class EstatesParsingModel {
  model: LlamaModel
  grammarState: LlamaGrammarEvaluationState
  promptParse: string
  promptConvert: string

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    this.model = new LlamaModel({
      modelPath: path.join(__dirname, '../../assets', 'model.gguf'),
      gpuLayers: 49
    })

    const grammarContents = fs.readFileSync(
      path.join(__dirname, '../../assets', 'grammar.gbnf'),
      'utf-8'
    )
    const grammar = new LlamaGrammar({ grammar: grammarContents })
    this.grammarState = new LlamaGrammarEvaluationState({ grammar })

    this.promptParse = fs.readFileSync(
      path.join(__dirname, '../../assets', 'prompt-parse.txt'),
      'utf-8'
    )
    this.promptConvert = fs.readFileSync(
      path.join(__dirname, '../../assets', 'prompt-convert.txt'),
      'utf-8'
    )
  }

  async parseEstateDescription(description: string): Promise<string> {
    const preEvaluation = await this.evaluate(
      `### System:\n${this.promptParse}\n\n### User:\n${description}\n\n### Assistant:\n`
    )
    console.log('D | Pre-evaluation:', preEvaluation)
    const result = await this.evaluate(
      `### System:\n${this.promptConvert}\n\n### User:\n${preEvaluation}\n\n### Assistant:\n`,
      true
    )
    return result
  }

  private async evaluate(prompt: string, json = false): Promise<string> {
    const context = new LlamaContext({
      model: this.model,
      batchSize: 4096,
      contextSize: 4096
    })

    const requestTokens = context.encode(prompt)

    const response = context.evaluate(requestTokens, {
      temperature: 0.1,
      ...(json && { grammarEvaluationState: this.grammarState })
    })
    const responseTokenList: number[] = []

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextToken = await response.next()
      if (nextToken.done) {
        break
      }
      responseTokenList.push(nextToken.value)
    }

    const responseTokens = new Uint32Array(responseTokenList)
    return context.decode(responseTokens)
  }
}
