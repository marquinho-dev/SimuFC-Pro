# Diretrizes de Design de Componentes - EletroSim-Pro

## REGRA FUNDAMENTAL: NUNCA ADICIONAR MOLDURA A COMPONENTES
1. **Sem moldura / Sem cartões / Sem caixas retangulares**:
   - Ao criar qualquer novo componente ou símbolo (seja no modo real ou no modo esquemático), NUNCA adicionar bordas externas, caixas com fundo retangular, cartões (`.schematic-device-card`, cards de fundo escuro com borda, etc.) ou cabeçalhos de cartão.
   - O componente deve ser 100% transparente ao redor de sua geometria.
   - No modo esquemático: apenas o traçado vetorial (símbolo elétrico, contatos, bobinas, bornes circulares e textos técnicos) deve ser desenhado, sobre fundo transparente.
   - No modo real: apenas a peça física realística (ex: lâmpada redonda 22mm, contator, botoeira) e seus parafusos/terminais devem ser renderizados, sem nenhum container retangular ao redor.

2. **Estado Padrão de Disjuntores e Contatores Esquemáticos**:
   - Disjuntores (`Q1`) e Contatores (`KM1` - contatos de força) iniciam por padrão com seus contatos **ABERTOS** (`closed: false`, `energized: false`).
   - A palheta móvel deve ser desenhada inclinada para a esquerda com abertura nítida em relação ao contato fixo.
