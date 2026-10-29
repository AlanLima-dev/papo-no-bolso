# 💸 App de Finanças Pessoais do ALAN com Vibe Coding

PRD refinado no copilot web:

``` markdown
# PRD - Organizador Financeiro Conversacional

## Visão do Produto

Criar um aplicativo de finanças pessoais que permita ao usuário registrar, consultar e acompanhar sua vida financeira por meio de conversas em linguagem natural.

O objetivo é eliminar a complexidade dos aplicativos tradicionais de gestão financeira, substituindo formulários manuais por uma experiência semelhante à de conversar com um assistente pessoal.

---

## Problema

Muitas pessoas tentam organizar suas finanças, mas abandonam o processo devido a:

- Excesso de cadastro manual de informações.
- Interfaces complexas e pouco intuitivas.
- Falta de personalização.
- Pouco acompanhamento educativo sobre hábitos financeiros.

Como consequência, os usuários perdem visibilidade sobre seus gastos e têm dificuldade para atingir metas financeiras.

---

## Oportunidade

Utilizar IA conversacional para transformar a experiência de controle financeiro em algo simples, natural e acessível.

Ao invés de preencher formulários, o usuário poderá simplesmente escrever:

"Gastei R$ 45 no almoço hoje."

E o sistema automaticamente:

- Identifica o valor.
- Detecta a categoria.
- Registra a transação.
- Atualiza relatórios.
- Gera recomendações quando relevante.

---

## Público-Alvo

### Primário

Pessoas iniciantes em educação financeira que desejam organizar gastos sem esforço.

### Secundário

Profissionais ocupados que buscam uma forma rápida de acompanhar suas finanças pessoais.

---

## Objetivos do MVP

1. Validar se usuários preferem registrar gastos por conversa em vez de formulários.
2. Medir a facilidade de uso do sistema.
3. Avaliar a aceitação de recomendações geradas por IA.
4. Validar se a categorização automática atende às expectativas dos usuários.

---

## Funcionalidades do MVP

### 1. Registro Conversacional de Gastos

O usuário pode informar despesas e receitas em linguagem natural.

Exemplos:

- "Gastei R$ 120 no mercado."
- "Recebi meu salário de R$ 4.500."
- "Paguei R$ 60 de internet."

Resultado esperado:

- Valor identificado.
- Tipo (receita ou despesa).
- Categoria sugerida.
- Registro salvo automaticamente.

---

### 2. Categorização Automática

A IA deve categorizar transações automaticamente.

Categorias iniciais:

- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Salário
- Investimentos
- Outros

O usuário pode corrigir categorias quando necessário.

---

### 3. Metas Financeiras

Permitir criação de objetivos financeiros.

Exemplos:

- Economizar R$ 5.000.
- Criar reserva de emergência.
- Juntar dinheiro para uma viagem.

O sistema deverá mostrar:

- Progresso atual.
- Valor restante.
- Percentual atingido.

---

### 4. Agente Financeiro

Assistente virtual responsável por:

- Responder dúvidas simples.
- Identificar padrões de gastos.
- Sugerir economia.
- Incentivar hábitos financeiros positivos.

Exemplos:

"Seus gastos com delivery aumentaram 25% neste mês."

"Você pode economizar cerca de R$ 200 por mês reduzindo pedidos de delivery."

---

### 5. Relatórios Simplificados

Visualização clara e amigável com:

- Gastos do mês.
- Gastos por categoria.
- Evolução mensal.
- Progresso das metas.

---

## Principais Telas

### Tela 1: Onboarding

Objetivos:

- Entender perfil financeiro do usuário.
- Configurar moeda.
- Criar primeira meta financeira.

---

### Tela 2: Chat Principal

Funcionalidades:

- Conversa com o Agente Financeiro.
- Registro de despesas.
- Registro de receitas.
- Perguntas e consultas.

---

### Tela 3: Dashboard

Indicadores:

- Saldo atual.
- Gastos do mês.
- Receitas do mês.
- Metas em andamento.

---

### Tela 4: Relatórios

Exibir:

- Gráficos simples.
- Distribuição por categorias.
- Histórico mensal.

---

### Tela 5: Metas Financeiras

Exibir:

- Lista de metas.
- Progresso.
- Recomendações relacionadas.

---

## Fluxos Principais

### Fluxo 1 - Registrar Gasto

Usuário digita uma mensagem

↓

IA interpreta a mensagem

↓

Sistema categoriza automaticamente

↓

Transação salva

↓

Dashboard atualizado

---

### Fluxo 2 - Consultar Finanças

Usuário pergunta:

"Quanto gastei com alimentação este mês?"

↓

IA consulta os dados

↓

Retorna valor e resumo

---

### Fluxo 3 - Receber Recomendação

Sistema identifica padrão de gasto

↓

Gera insight financeiro

↓

Exibe recomendação personalizada

---

## Design Universal e Acessibilidade

A solução deve seguir os princípios de Design Universal para garantir que o maior número possível de pessoas consiga utilizar o aplicativo com autonomia, conforto e eficiência, independentemente de idade, experiência digital ou condição física e cognitiva.

### Objetivos

- Tornar o aplicativo acessível para iniciantes em tecnologia.
- Reduzir barreiras para pessoas com deficiência.
- Garantir experiência simples e intuitiva.
- Minimizar a necessidade de treinamento.

### Diretrizes

#### Interface Simples

- Linguagem clara e objetiva.
- Poucas ações por tela.
- Fluxos intuitivos.
- Foco nas tarefas principais.

#### Legibilidade

- Alto contraste.
- Tipografia de fácil leitura.
- Espaçamento adequado.
- Hierarquia visual clara.

#### Acessibilidade

- Compatibilidade com leitores de tela.
- Navegação por teclado.
- Textos alternativos para elementos visuais.
- Feedback visual e textual para ações importantes.

#### Inclusão Cognitiva

- Evitar jargões financeiros.
- Explicar conceitos complexos de forma simples.
- Apresentar dados por meio de resumos visuais e linguagem acessível.

#### Mobile First

- Experiência otimizada para smartphones.
- Componentes adaptáveis a diferentes tamanhos de tela.
- Botões com área de toque confortável.

### Critérios de Qualidade

O usuário deve conseguir:

- Registrar uma despesa em menos de 30 segundos.
- Entender sua situação financeira sem treinamento prévio.
- Navegar pelas principais funcionalidades sem consultar tutoriais.
- Utilizar o aplicativo com tecnologias assistivas.

---

## Critérios de Sucesso

O MVP será considerado validado se:

- 80% dos usuários conseguirem registrar gastos sem ajuda.
- 70% aprovarem a categorização automática.
- 60% utilizarem o aplicativo por pelo menos uma semana.
- A maioria relatar mais facilidade em comparação com planilhas ou aplicativos tradicionais.

---

## Requisitos Não Funcionais

### Usabilidade

- Interface intuitiva.
- Curva de aprendizado mínima.
- Linguagem amigável.
- Design Universal aplicado em todas as telas.

### Performance

- Registro de transações em até 2 segundos.
- Navegação fluida em dispositivos móveis.

### Segurança

- Proteção dos dados financeiros.
- Autenticação segura.
- Conformidade com LGPD.

### Acessibilidade

- Compatibilidade com WCAG 2.1 nível AA.
- Navegação por teclado.
- Suporte a leitores de tela.
- Contraste adequado.
- Componentes acessíveis para pessoas com limitações visuais, motoras e cognitivas.

---

## Fora do Escopo do MVP

Não desenvolver inicialmente:

- Integração bancária.
- Open Finance.
- Investimentos avançados.
- Planejamento tributário.
- Compartilhamento familiar.
- Cartões de crédito automáticos.

---

## Entregável Esperado do Lovable

Gerar uma aplicação MVP contendo:

- Onboarding inicial.
- Chat conversacional.
- Dashboard financeiro.
- Gestão de metas.
- Relatórios simples.
- Agente Financeiro com recomendações.

A aplicação deve possuir design moderno, responsivo, acessível e alinhado aos princípios de Design Universal.

A experiência deve priorizar:

- Simplicidade.
- Inclusão.
- Clareza.
- Acessibilidade.
- Mobile First.
- Facilidade para iniciantes em educação financeira.

A navegação deve exigir o mínimo possível de aprendizado e permitir que novos usuários realizem as principais tarefas sem necessidade de treinamento.
```
  interações com o lovable
  crie um app de finanças pessoais com base no seguinte PRD (Product Requirements Document): (PRD)
  
  Resultado final no lovable https://lovable.dev/projects/a4838201-143d-4e48-81e9-a01cbe04468f?preview-path=%2Flogin
  
  <img width="796" height="2268" alt="image" src="https://github.com/user-attachments/assets/23ed3254-e17c-4d58-a18a-2a67429d216f" />

   
  ## reflexão 
  
  ### O que funcionou bem? 
  o refinamento do PRD previamente feito no copilot ajudou muito, pois os créditos do lovable acabaram em apenas 3 interações
  
  ### O que não funcionou como o esperado?  
  esperava interagir mais vezes com o lovable, mas as interações feitas foram de grande valia para aprender mais sobre vibe coding
  
  ### O que aprendeu sobre conversar com IAs?
  aprendi que é basicamente igual  a conversar com uma pessoa, quanto mais clareza você da melhor a interação


## 💬 Conclusão

Vibe Coding é sobre clareza, curiosidade e criatividade, não sobre perfeição técnica. O verdadeiro objetivo aqui é aprender a pensar junto com a IA, transformando ideias em conceitos reais e enxergando a tecnologia como uma extensão do seu raciocínio criativo. Cada interação é um experimento, quanto mais clara for sua intenção, mais surpreendente será o resultado.
