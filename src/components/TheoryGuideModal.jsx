import React from 'react';
import { X, BookOpen, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function TheoryGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog theory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen className="header-icon" />
            <h2>GUIA TÉCNICO: COMANDOS ELÉTRICOS INDUSTRIAIS & AUTOMAÇÃO</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body theory-body">
          {/* Seção 1: Arquitetura Universal */}
          <div className="theory-section">
            <div className="section-title">
              <Zap className="sec-icon" />
              <h3>1. Arquitetura Universal de Comandos Elétricos Industriais</h3>
            </div>
            <p>
              Em qualquer painel elétrico industrial e sistema de automação eletromecânica, a instalação é sempre dividida em duas partes essenciais e complementares:
            </p>
            <div className="info-box">
              <ul>
                <li>
                  <strong>Circuito de Potência (Força):</strong> Responsável por conduzir altas correntes elétricas da rede de alimentação até as cargas finais de trabalho (motores elétricos, bancos de resistências de aquecimento, bombas, solenoides ou transformadores). Utiliza condutores de maior bitola e contatos principais reforçados (1-2, 3-4, 5-6).
                </li>
                <li>
                  <strong>Circuito de Comando (Controle e Lógica):</strong> É o "cérebro" da instalação. Opera com correntes baixas e tensões de controle seguras (24V, 110V ou 220V). É composto por botoeiras (NA/NF), contatos auxiliares, relés de proteção, temporizadores e sensores. Controla <em>quando</em> e <em>como</em> as cargas de potência devem ligar ou desligar.
                </li>
              </ul>
            </div>
          </div>

          {/* Seção 2: Lógica de Retenção e Intertravamento */}
          <div className="theory-section">
            <div className="section-title">
              <Cpu className="sec-icon" />
              <h3>2. Lógica de Retenção ("Selo") e Intertravamento</h3>
            </div>
            <p>
              A lógica de comando básica utiliza comandos por pulso para segurança dos operadores (evitando que máquinas religuem sozinhas após queda de energia):
            </p>
            <ol>
              <li>
                <strong>Contato de Selo (13-14 NA de K1):</strong> A botoeira de partida (S1) é um pulsador momentâneo. Ao ser pressionada, energiza a bobina <strong>A1-A2</strong> do contator. O contato auxiliar normalmente aberto (13-14 NA) fecha imediatamente em paralelo com a botoeira, mantendo a bobina alimentada mesmo após o operador soltar o botão.
              </li>
              <li>
                <strong>Comando de Desligamento e Parada de Emergência:</strong> Botoeiras com contato NF (como S0 1-2) são ligadas em série antes do circuito de selo. Ao serem abertas, desfazem a retenção magnética da bobina, desarmando o contator instantaneamente.
              </li>
              <li>
                <strong>Intertravamento Elétrico:</strong> Utiliza contatos normalmente fechados (NF 21-22) cruzados entre dois contatores distintos (ex: reversão de rotação ou chave estrela-triângulo) para garantir que um contator nunca possa ser acionado enquanto o outro estiver ligado, prevenindo curto-circuitos diretos entre fases.
              </li>
            </ol>
          </div>

          {/* Seção 3: Proteção e Seccionamento */}
          <div className="theory-section">
            <div className="section-title">
              <ShieldCheck className="sec-icon" />
              <h3>3. Dispositivos de Proteção & Seccionamento</h3>
            </div>
            <p>
              Instalações industriais demandam múltiplos níveis de proteção coordenada para proteger pessoas, condutores e cargas:
            </p>
            <ul>
              <li>
                <strong>Disjuntores Termomagnéticos (Tripolar Q1 / Unipolar Q2):</strong> Protegem contra curto-circuitos instantâneos (disparo magnético) e sobrecargas de corrente na fiação (disparo térmico). Devem seccionar todos os condutores de fase.
              </li>
              <li>
                <strong>Relé Térmico de Sobrecarga (RT1):</strong> Protege cargas e motores contra correntes elevadas sustentadas (sobrecarga mecânica ou perda de uma fase). O contato <strong>95-96 (NF)</strong> abre a linha de comando para desenergizar a bobina do contator, enquanto o contato <strong>97-98 (NA)</strong> aciona sinalizadores de alarme sonoro ou visual (H3).
              </li>
            </ul>
          </div>

          {/* Seção 4: Cargas Industriais */}
          <div className="theory-section">
            <div className="section-title">
              <Zap className="sec-icon" />
              <h3>4. Cargas Industriais Acionadas por Contatores</h3>
            </div>
            <p>
              O simulador atende a todos os tipos de comandos eletrotécnicos para diferentes atuadores:
            </p>
            <div className="motor-schematics-grid">
              <div className="fechamento-card">
                <h4>Motores de Indução Trifásicos (MIT)</h4>
                <p>
                  Carga indutiva com enrolamentos trifásicos de 6 pontas (U1-U2, V1-V2, W1-W2). Suporta fechamento em <strong>Estrela (Y)</strong> para tensões maiores (380V) e <strong>Triângulo (Δ)</strong> para tensões menores (220V), partidas diretas, reversão e partidas suaves.
                </p>
              </div>
              <div className="fechamento-card">
                <h4>Cargas Resistivas, Iluminação e Solenoides</h4>
                <p>
                  Sistemas de aquecimento industrial (estufas, fornos), bancos de capacitores, sinalização luminosa/acústica e válvulas solenoides acionadas por contatos de relés e contatores em sistemas de automação de processos.
                </p>
              </div>
            </div>
          </div>

          {/* Seção 5: Tutor do Simulador */}
          <div className="theory-section tutor-guide-highlight">
            <div className="section-title">
              <span className="sec-emoji">🎓</span>
              <h3>5. Tutor do Simulador: Dicas Práticas de Montagem & Fiação</h3>
            </div>
            <div className="tutor-tips-grid">
              <div className="tutor-tip-item">
                <div className="tutor-tip-header">🔌 Conectar Bornes</div>
                <p>
                  Clique no primeiro borne (ficará com anel azul pulsante). Em seguida, clique no borne de destino. O condutor é gerado com autorroteamento inteligente em 90° e pontes nos cruzamentos!
                </p>
              </div>

              <div className="tutor-tip-item">
                <div className="tutor-tip-header">🔗 Múltiplos Fios & Emendas de Derivação</div>
                <p>
                  Você pode conectar múltiplos fios no mesmo borne OU clicar em qualquer ponto de um fio já existente para criar uma <strong>emenda de derivação</strong> com ponto de solda/junção industrial!
                </p>
              </div>

              <div className="tutor-tip-item">
                <div className="tutor-tip-header">↔️ Ajustar Trajeto do Fio Livremente</div>
                <p>
                  Clique sobre qualquer fio para selecioná-lo. Arraste os <strong>pontos nos segmentos</strong> para afastar o condutor de outros aparelhos ou desenhar as canaletas do jeito que preferir!
                </p>
              </div>

              <div className="tutor-tip-item">
                <div className="tutor-tip-header">⚙️ Contator K1: Teste Manual & Selo NA (13-14)</div>
                <p>
                  • <strong>Teste Manual:</strong> Clique no êmbolo central / botão do contator para acioná-lo manualmente.
                  <br />
                  • <strong>Fechamento do contato NA (13-14):</strong> Ao acionar o contator, o contato <strong>13-14 fecha imediatamente</strong> (● FECHADO) conduzindo corrente para a retenção do circuito!
                </p>
              </div>

              <div className="tutor-tip-item">
                <div className="tutor-tip-header">🔍 Zoom & Navegação Estáveis</div>
                <p>
                  Gire a roda do mouse para aproximar ou afastar a bancada de forma centralizada e simétrica. Arraste com o botão do mouse sobre o fundo para deslocar a visualização.
                </p>
              </div>

              <div className="tutor-tip-item">
                <div className="tutor-tip-header">➕ Adicionar Componentes</div>
                <p>
                  Utilize o botão <strong>+ Componente</strong> no topo ou a barra rápida à esquerda. Os novos aparelhos sempre surgem diretamente no centro da sua tela visível.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
