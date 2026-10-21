# SimuFC Pro - Simulador de Comandos Elétricos Industriais

Simulador interativo de comandos elétricos e automação industrial voltado para o estudo, prática e validação de esquemas elétricos conforme normas **ABNT NBR 5410** e **IEC 60947**.

## ⚡ Componentes Disponíveis
- **Fonte de Alimentação**: Barramento trifásico com terminais `L1`, `L2`, `L3`, `N` (Neutro) e `PE` (Terra/Proteção) com chave seccionadora geral e voltímetro digital.
- **Motor Trifásico de 6 Pontas**: Motor de indução (2 CV) com caixa de bornes para fechamento em **Estrela (Y 380V)** ou **Triângulo (Δ 220V)**, animação do rotor com inércia física, tacômetro digital (RPM) e amperímetro.
- **Contator K1 (25A)**: Bobina `A1-A2`, contatos de potência principais `1-2`, `3-4`, `5-6` (NA), contato auxiliar de **selo** `13-14` (NA) e contato auxiliar de intertravamento/sinalização `21-22` (NF), com animação mecânica do êmbolo móvel.
- **Relé Térmico de Sobrecarga (RT1)**: Contatos de força `1-2`, `3-4`, `5-6`, contato de desarme `95-96` (NF), contato de alarme `97-98` (NA), botão de teste **TRIP / TESTE** e botão **RESET**.
- **Botoeiras Industriais**:
  - `S1` (Liga - Verde): Pulsador Normalmente Aberto (`3-4` NA).
  - `S0` (Desliga - Vermelha): Pulsador Normalmente Fechado (`1-2` NF).
- **Sinalizadores / LEDs Pilot**:
  - `H1` (Verde): Motor em operação.
  - `H2` (Vermelho): Motor desligado / Standby.
  - `H3` (Amarelo): Sobrecarga / Falha térmica do relé.
- **Disjuntores Termomagnéticos**:
  - `Q1`: Disjuntor Geral Tripolar (Potência).
  - `Q2`: Disjuntor Unipolar (Comando).

## 🛠️ Recursos de Destaque
- **Engine Elétrica Graph-Based**: Resolução de equipotenciais, circuito de comando e força, retenção de selo e detecção de curto-circuito em tempo real.
- **Fiação Interativa Flexível**: Conecte fios clicando de borne em borne com curvas de Bézier e paleta de cores normalizadas.
- **Efeitos Sonoros Realistas**: Síntese de áudio Web Audio API (batida do contator, clique de botoeiras, zumbido harmônico de 60Hz do motor).
- **Multímetro Digital True-RMS Integrado**: Pontas de prova para medição de tensões de linha e de fase.
- **Diagrama Esquemático Interativo**: Exibe os esquemas unifilar e multifilar com linhas energizadas destacadas ao vivo.
- **Guia Didático Teórico**: Explicações detalhadas sobre partida direta, contato de selo e fechamento de 6 pontas.

## 🚀 Como Executar
```bash
npm install
npm run dev
```
Acesse no navegador: `http://localhost:5173/`
