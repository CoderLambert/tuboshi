import type { DemoLang, DemoScenario } from './types'

export const DEMO_LANGS: { code: DemoLang, label: string }[] = [
  { code: 'CN', label: '中' },
  { code: 'EN', label: 'EN' },
  { code: 'PT', label: 'PT' },
]

export const DEMO_USER = {
  token: 'demo-token-not-real',
  userCode: 'DEMO-COURIER-0001',
  userName: '演示快递员',
  siteName: '示例市滨江营业部（虚构）',
}

export const DEMO_GPT = {
  app_key: 'demo-key-not-real',
  app_id: 'demo-courier-assistant',
  api_url: 'https://llm.example.com/v1',
}

export const DEMO_PARAMETERS = {
  opening_statement: '',
  suggested_questions: [] as string[],
  suggested_questions_after_answer: { enabled: true },
  speech_to_text: { enabled: false },
  text_to_speech: { enabled: false },
  retriever_resource: { enabled: false },
  annotation_reply: { enabled: false },
  more_like_this: { enabled: false },
  user_input_form: [],
  file_upload: {
    enabled: false,
    image: { enabled: false, number_limits: 3, transfer_methods: ['local_file'] },
  },
  system_parameters: { image_file_size_limit: 10, file_size_limit: 15 },
}

type QaCategory = {
  questionCategory: string
  qaItemList: { question: string, answer: string }[]
}

const q = (question: string) => ({ question, answer: '' })

export const DEMO_FAQ: Record<DemoLang, QaCategory[]> = {
  CN: [
    {
      questionCategory: '地址/路线',
      qaItemList: [
        q('星河路 88 号的派送路线怎么走最快？'),
        q('客户地址只写了“滨江花园”，怎么确认门牌？'),
        q('今天下午 6 个派件点，帮我排个路线'),
      ],
    },
    {
      questionCategory: '危禁品',
      qaItemList: [
        q('充电宝能寄吗？有什么要求？'),
        q('客户要寄香水和指甲油，可以收吗？'),
        q('哪些物品属于禁寄品？'),
      ],
    },
    {
      questionCategory: '运费',
      qaItemList: [
        q('3.6 公斤寄到邻市运费多少？'),
        q('体积大但很轻的包裹怎么计费？'),
        q('保价费怎么算？'),
      ],
    },
  ],
  EN: [
    {
      questionCategory: 'Address / Route',
      qaItemList: [
        q('What is the fastest route to 88 Galaxy Road?'),
        q('The address only says "Riverside Garden" — how do I find the unit?'),
        q('Plan a route for my 6 afternoon drop-offs'),
      ],
    },
    {
      questionCategory: 'Dangerous goods',
      qaItemList: [
        q('Can a customer ship a power bank?'),
        q('Can I accept perfume and nail polish?'),
        q('Which items are prohibited?'),
      ],
    },
    {
      questionCategory: 'Shipping fee',
      qaItemList: [
        q('How much to ship 3.6 kg to the next city?'),
        q('How is a large but light parcel charged?'),
        q('How is the insurance fee calculated?'),
      ],
    },
  ],
  PT: [
    {
      questionCategory: 'Endereço / Rota',
      qaItemList: [
        q('Qual a rota mais rápida até a Rua Galáxia, 88?'),
        q('O endereço diz só "Jardim Ribeirinho" — como achar a unidade?'),
        q('Monte a rota das minhas 6 entregas da tarde'),
      ],
    },
    {
      questionCategory: 'Artigos perigosos',
      qaItemList: [
        q('O cliente pode enviar um power bank?'),
        q('Posso aceitar perfume e esmalte?'),
        q('Quais itens são proibidos?'),
      ],
    },
    {
      questionCategory: 'Frete',
      qaItemList: [
        q('Quanto custa enviar 3,6 kg para a cidade vizinha?'),
        q('Como é cobrado um pacote grande e leve?'),
        q('Como é calculada a taxa de seguro?'),
      ],
    },
  ],
}

export const DEMO_ANSWERS: Record<DemoScenario, Record<DemoLang, string>> = {
  route: {
    CN: `好的，已根据你当前位置（**示例市滨江营业部**）规划路线 🚚

### 推荐路线（约 4.2 km · 预计 18 分钟）

| 派件点 | 到达 | 备注 |
|---|---|---|
| ① 星河路 88 号 2 栋 | 14:10 | 有快递柜 |
| ② 滨江花园 6 栋 | 14:22 | 门禁 0602 |
| ③ 云栖科创园 B 座 | 14:35 | 前台 18 点下班 |
| ④ 南湖小区北门驿站 | 14:48 | 拍照签收 |

**小贴士：**
1. 先送有时效要求的件（标注“当日达”的 2 件）。
2. 星河路 14:00–15:00 学校放学，建议走 **滨江大道** 绕行。
3. 遇到地址模糊时，可以点击运单里的“联系客户”，系统会用虚拟号拨打。

> 以上路线为演示数据，实际以导航为准。`,
    EN: `Sure — here's a route planned from your current location (**Demo City Riverside Station**) 🚚

### Suggested route (≈ 4.2 km · ~18 min)

| Stop | ETA | Note |
|---|---|---|
| ① 88 Galaxy Rd, Bldg 2 | 14:10 | Locker |
| ② Riverside Garden, Bldg 6 | 14:22 | Code 0602 |
| ③ Cloud Valley Park, Tower B | 14:35 | Desk till 18:00 |
| ④ South Lake pickup point | 14:48 | Photo proof |

**Tips**
1. Deliver the 2 *same-day* parcels first.
2. Galaxy Rd is busy 14:00–15:00 (school pickup) — take **Riverside Ave** instead.
3. If an address is unclear, tap "Contact customer" in the waybill to call via a masked number.

> Demo data only — follow your navigation app on the road.`,
    PT: `Certo — rota planejada a partir da sua localização (**Base Ribeirinha, Cidade Exemplo**) 🚚

### Rota sugerida (≈ 4,2 km · ~18 min)

| Parada | Chegada | Obs. |
|---|---|---|
| ① Rua Galáxia, 88 | 14:10 | Armário |
| ② Jardim Ribeirinho, Bl. 6 | 14:22 | Interfone 0602 |
| ③ Parque Vale das Nuvens | 14:35 | Recepção até 18h |
| ④ Ponto Lago Sul | 14:48 | Foto obrigatória |

**Dicas**
1. Entregue primeiro os 2 pacotes *no mesmo dia*.
2. A Rua Galáxia fica congestionada das 14:00 às 15:00 — use a **Av. Ribeirinha**.
3. Endereço confuso? Toque em "Contatar cliente" para ligar por número mascarado.

> Dados de demonstração — siga o seu app de navegação.`,
  },
  dangerous: {
    CN: `这个问题我帮你按**演示版收寄规则**判断一下 ⚠️

### 判断结果：充电宝 —— **限制收寄**

| 物品 | 结论 | 条件 |
|---|---|---|
| 充电宝 ≤2万mAh | ⚠️ 限寄 | 原包装，≤2 个 |
| 充电宝 >2万mAh | ❌ 不收 | 超出能量上限 |
| 香水 ≤50ml | ⚠️ 限寄 | 防漏，仅陆运 |
| 指甲油 | ❌ 不收 | 易燃液体 |
| 打火机、烟花 | ❌ 禁寄 | 易燃易爆 |

**收件时请这样做：**
1. 打开 App 里的“验视”页，**拍照记录**物品外观与标签；
2. 询问客户锂电池容量，看不到标签的一律不收；
3. 限寄品在运单备注栏勾选“含电池 / 含液体”。

> 提示：规则为演示用虚构规则，请以所在网点最新规定为准。`,
    EN: `Let me check this against the **demo acceptance rules** ⚠️

### Result: power bank — **restricted**

| Item | Result | Condition |
|---|---|---|
| Power bank ≤20k mAh | ⚠️ Limited | Boxed, max 2 |
| Power bank >20k mAh | ❌ No | Over energy limit |
| Perfume ≤50 ml | ⚠️ Limited | Leak-proof, ground |
| Nail polish | ❌ No | Flammable |
| Lighters, fireworks | ❌ Banned | Explosive |

**At pickup:**
1. Open the *Inspection* page and **take photos** of the item and labels.
2. Ask for the battery capacity — no label, no pickup.
3. Tick "Contains battery / liquid" in the waybill remarks.

> Demo rules only — always follow your station's latest policy.`,
    PT: `Vou verificar pelas **regras de aceitação (demo)** ⚠️

### Resultado: power bank — **restrito**

| Item | Resultado | Condição |
|---|---|---|
| Power bank ≤20 mil mAh | ⚠️ Restrito | Na caixa, máx. 2 |
| Power bank >20 mil mAh | ❌ Não | Acima do limite |
| Perfume ≤50 ml | ⚠️ Restrito | Lacrado, terrestre |
| Esmalte | ❌ Não | Inflamável |
| Isqueiros, fogos | ❌ Proibido | Explosivo |

**Na coleta:**
1. Abra a página *Inspeção* e **fotografe** o item e as etiquetas.
2. Pergunte a capacidade da bateria — sem etiqueta, não coletar.
3. Marque "Contém bateria / líquido" nas observações.

> Regras fictícias de demonstração.`,
  },
  fee: {
    CN: `好的，按**演示价目表**帮你算一下 💰

### 计费规则（虚构）
- 首重 1 kg：**¥8.00**
- 续重每 0.5 kg：**¥1.50**（不足 0.5 kg 按 0.5 kg 计）
- 计费重量取 **实际重量** 与 **体积重量** 的较大值，体积重量 = 长×宽×高(cm) ÷ 6000

$$
\\text{运费} = 8 + \\left\\lceil \\frac{W - 1}{0.5} \\right\\rceil \\times 1.5
$$

### 本单计算：3.6 kg 寄邻市

| 项目 | 数值 |
|---|---|
| 实际重量 | 3.6 kg |
| 体积重量（40×30×20） | 4.0 kg |
| **计费重量** | **4.0 kg** |
| 续重段数 | ⌈(4.0 − 1) ÷ 0.5⌉ = 6 |
| **运费** | 8 + 6 × 1.5 = **¥17.00** |

> 如需保价：保价费 = 声明价值 × 0.5%，最低 ¥1。以上均为演示数据。`,
    EN: `Sure — calculated with the **demo price table** 💰

### Rules (fictional)
- First 1 kg: **$2.00**
- Each extra 0.5 kg: **$0.40** (rounded up)
- Chargeable weight = max(**actual**, **volumetric**); volumetric = L×W×H (cm) ÷ 6000

$$
\\text{Fee} = 2 + \\left\\lceil \\frac{W - 1}{0.5} \\right\\rceil \\times 0.4
$$

### This parcel: 3.6 kg to the next city

| Item | Value |
|---|---|
| Actual weight | 3.6 kg |
| Volumetric (40×30×20) | 4.0 kg |
| **Chargeable** | **4.0 kg** |
| Extra steps | ⌈(4.0 − 1) ÷ 0.5⌉ = 6 |
| **Fee** | 2 + 6 × 0.4 = **$4.40** |

> Insurance: declared value × 0.5%, minimum $0.20. Demo data only.`,
    PT: `Certo — calculado pela **tabela de preços (demo)** 💰

### Regras (fictícias)
- Primeiro 1 kg: **R$ 10,00**
- Cada 0,5 kg adicional: **R$ 2,00** (arredonda para cima)
- Peso cobrado = máx(**real**, **cubado**); cubado = C×L×A (cm) ÷ 6000

$$
\\text{Frete} = 10 + \\left\\lceil \\frac{P - 1}{0.5} \\right\\rceil \\times 2
$$

### Este pacote: 3,6 kg para a cidade vizinha

| Item | Valor |
|---|---|
| Peso real | 3,6 kg |
| Peso cubado (40×30×20) | 4,0 kg |
| **Peso cobrado** | **4,0 kg** |
| Faixas extras | ⌈(4,0 − 1) ÷ 0,5⌉ = 6 |
| **Frete** | 10 + 6 × 2 = **R$ 22,00** |

> Seguro: valor declarado × 0,5%, mínimo R$ 1,00. Dados de demonstração.`,
  },
  generic: {
    CN: `收到！我是快递员 AI 助手（演示版），目前可以帮你：

- 🗺️ **地址 / 路线**：模糊地址识别、多点派件排线
- ⚠️ **危禁品判断**：电池、液体、易燃品能不能收
- 💰 **运费计算**：首重续重、体积重、保价费

试试问我：“**3.6 公斤寄到邻市运费多少？**”`,
    EN: `Got it! I'm the courier AI assistant (demo). I can help with:

- 🗺️ **Address / route** — fuzzy address lookup, multi-stop planning
- ⚠️ **Dangerous goods** — batteries, liquids, flammables
- 💰 **Shipping fee** — base + extra weight, volumetric weight, insurance

Try: "**How much to ship 3.6 kg to the next city?**"`,
    PT: `Entendido! Sou o assistente de IA do entregador (demo). Posso ajudar com:

- 🗺️ **Endereço / rota** — endereços vagos, rotas com várias paradas
- ⚠️ **Artigos perigosos** — baterias, líquidos, inflamáveis
- 💰 **Frete** — peso inicial e adicional, peso cubado, seguro

Tente: "**Quanto custa enviar 3,6 kg para a cidade vizinha?**"`,
  },
}

export const DEMO_FOLLOWUPS: Record<DemoScenario, Record<DemoLang, string[]>> = {
  route: {
    CN: ['如果客户不在家怎么处理？', '帮我把第 3 站改到最后', '附近有哪些快递柜？'],
    EN: ['What if the customer is not home?', 'Move stop 3 to the end', 'Any parcel lockers nearby?'],
    PT: ['E se o cliente não estiver em casa?', 'Mova a parada 3 para o fim', 'Há armários por perto?'],
  },
  dangerous: {
    CN: ['电动车电池能寄吗？', '液体类物品怎么包装？', '误收了禁寄品怎么办？'],
    EN: ['Can I ship an e-bike battery?', 'How should liquids be packed?', 'What if I accepted a prohibited item?'],
    PT: ['Posso enviar bateria de bicicleta elétrica?', 'Como embalar líquidos?', 'E se aceitei um item proibido?'],
  },
  fee: {
    CN: ['保价 2000 元要多少钱？', '到付和寄付有什么区别？', '体积重量怎么量？'],
    EN: ['Insurance for $300 declared value?', 'Sender-pays vs. receiver-pays?', 'How to measure volumetric weight?'],
    PT: ['Seguro para R$ 2.000 declarados?', 'Frete pago x a cobrar?', 'Como medir o peso cubado?'],
  },
  generic: {
    CN: ['充电宝能寄吗？', '3.6 公斤寄到邻市运费多少？', '帮我排一下今天下午的派件路线'],
    EN: ['Can a customer ship a power bank?', 'How much to ship 3.6 kg?', 'Plan my afternoon route'],
    PT: ['Posso enviar um power bank?', 'Quanto custa enviar 3,6 kg?', 'Monte minha rota da tarde'],
  },
}

export function detectScenario(text: string): DemoScenario {
  if (/危|禁|锂|电池|充电宝|香水|指甲油|液体|dangerous|prohibit|battery|power bank|perfume|polish|perigos|proibid|bateria|esmalte/i.test(text))
    return 'dangerous'
  if (/运费|费用|多少钱|计费|保价|公斤|kg|fee|cost|price|charge|insurance|frete|custo|preço|cobrad|seguro/i.test(text))
    return 'fee'
  if (/地址|路线|路径|导航|门牌|派件点|排.*路|address|route|road|drop-off|unit|endereço|rota|rua|entregas/i.test(text))
    return 'route'
  return 'generic'
}

export function detectLang(text: string, fallback: DemoLang): DemoLang {
  if (/[一-鿿]/.test(text))
    return 'CN'
  if (/[ãõçáéíóúâêô]|\b(qual|como|quanto|posso|pode|rota|frete|endereço|entregas)\b/i.test(text))
    return 'PT'
  if (/[a-z]/i.test(text))
    return 'EN'
  return fallback
}
