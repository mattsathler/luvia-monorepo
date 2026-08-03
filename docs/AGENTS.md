# AGENTS.md

# Luvia

Este documento é a fonte de verdade para qualquer agente de IA trabalhando neste projeto.

Caso exista conflito entre este documento e sugestões do agente, este documento deve ser considerado correto.

---

# Visão Geral

Luvia é um MMORPG Social Idle desenvolvido para Web.

O objetivo não é controlar um personagem em tempo real.

O jogador controla **as decisões da vida** do personagem enquanto o sistema simula o mundo.

A filosofia do jogo é:

> Você administra uma vida, não um avatar.

O jogo é inspirado em:

- Habbo Hotel
- The Sims
- Torn
- Stardew Valley
- Idle Games

Mas possui identidade própria.

---

# Princípios

Toda decisão de design deve seguir estes princípios.

## Cozy First

Luvia deve ser confortável.

Nada deve gerar ansiedade.

Não existem punições severas.

Não existe FOMO.

O jogador pode voltar horas depois sem sentir que perdeu tudo.

---

## Idle First

O jogo não é controlado em tempo real.

O jogador escolhe uma atividade.

O personagem executa.

O tempo passa sozinho.

---

## Social First

Toda mecânica deve incentivar interação entre jogadores.

Mesmo sistemas econômicos devem existir para conectar pessoas.

Nunca criar mecânicas totalmente isoladas.

---

## Long Term Progression

Luvia deve durar anos.

Todo progresso deve ser lento.

Nada deve ser facilmente maximizado.

---

# O jogador

O jogador controla apenas decisões.

Exemplos:

- Trabalhar
- Estudar
- Descansar
- Dormir
- Ir para um evento
- Fazer compras
- Encontrar amigos

Ele NÃO controla:

- Movimento
- Combate
- Caminhar
- Animações

---

# Não existe combate

Luvia não possui:

- HP
- Mana
- Armas
- Classes
- PvP
- Dungeons
- Bosses

Nunca sugerir sistemas inspirados em MMORPGs tradicionais.

---

# Progressão

O jogo utiliza Fama como principal indicador de progresso.

Não existe Level.

Nunca utilizar "Level" em interfaces.

Sempre utilizar "Fama".

---

# Necessidades do personagem

Todo personagem possui:

- Felicidade
- Energia / Cansaço
- Dinheiro
- Fama

Esses atributos representam sua vida.

---

# Estudos

O jogador pode estudar.

Estudar aumenta habilidades.

Habilidades permitem:

- melhores empregos
- promoções
- abrir empresas
- produzir melhor

Nunca existem classes.

---

# Trabalho

Existem dois tipos de trabalho.

## Público

Fornecido pela cidade.

Sempre disponível.

Baixo salário.

Seguro.

---

## Empresas de jogadores

Criadas pelos próprios jogadores.

Podem pagar mais.

Dependem da economia.

---

# Empresas

Empresas pertencem aos jogadores.

Tipos:

- Comércio
- Indústria

Empresas:

- contratam jogadores
- compram materiais
- vendem produtos
- administram contratos

---

# Economia

Existe uma cidade controlada pelo sistema.

Ela representa consumidores.

A cidade:

- compra produtos
- vende produtos
- gera empregos públicos

Ela regula a economia.

---

# Sistema Industrial

A indústria produz matéria-prima.

O comércio transforma.

Depois vende para a cidade.

Fluxo:

Indústria

↓

Comércio

↓

Cidade

---

# Contratos

Empresas podem criar contratos entre si.

Um contrato possui:

- produto
- quantidade
- prazo
- valor

O contrato pode falhar.

---

# Relacionamentos

Relacionamentos são um dos pilares.

Existem níveis como:

- conhecido
- amigo
- melhor amigo
- namoro
- casamento

Relacionamentos influenciam diversas mecânicas.

---

# Chat

Não existe chat em tempo real.

Nunca sugerir chat global.

Nunca sugerir chat privado.

Interações devem ocorrer por ações do jogo.

---

# Cidade

Existe apenas uma cidade.

Todos vivem nela.

A cidade é persistente.

---

# Mundo

A visualização principal é isométrica.

Pixel Art.

Cozy.

Poucos elementos animados.

Sem excesso de efeitos.

---

# Lotes

Existem três tipos.

Residencial

Comercial

Industrial

Cada jogador pode possuir:

- 1 residencial
- 1 comercial
- 1 industrial

---

# Construção

Os lotes podem ser evoluídos.

Construções melhoram funcionalidades.

Nunca utilizar sistemas complexos de construção manual.

---

# Eventos

Eventos são importantes.

Exemplos:

- Festa
- Congresso
- Feira
- Festival
- Evento sazonal

Eventos aumentam:

- Fama
- Relacionamentos
- Habilidades

---

# Interface

A interface deve seguir estes princípios.

- limpa
- minimalista
- cozy
- confortável
- poucos elementos simultâneos

Nunca criar interfaces poluídas.

---

# Arte

Pixel Art.

Cozy.

Pouco contraste.

Sem cores extremamente saturadas.

Paleta suave.

---

# Logo

Tema:

- chuva
- nuvem
- aconchego

Evitar aparência infantil.

Evitar aparência feminina excessiva.

---

# Tecnologia

Monorepo.

Packages separados.

Estrutura:

packages/

apps/

Bibliotecas:

- React
- TypeScript
- Vite
- SCSS

Não utilizar Tailwind.

---

# Design System

Existe um Design System chamado:

Luv.UI

Todo componente visual deve pertencer ao Luv.UI.

Evitar CSS repetido.

---

# Organização

Cada feature deve ser independente.

Evitar arquivos gigantes.

Priorizar:

- composição
- reutilização
- baixo acoplamento

---

# Filosofia de Código

Sempre preferir:

clareza

ao invés de

esperteza.

Código simples é melhor que código inteligente.

---

# Filosofia de Componentes

Componentes devem possuir responsabilidade única.

Preferir pequenos componentes.

Evitar componentes acima de ~300 linhas.

---

# TypeScript

Nunca utilizar any.

Sempre tipar corretamente.

Preferir:

type

para estruturas.

Utilizar interface apenas quando fizer sentido.

---

# CSS

Utilizar SCSS.

Evitar CSS inline.

Evitar !important.

Priorizar variáveis.

---

# IA

Sempre que propor uma nova funcionalidade, verificar se ela respeita:

- Cozy First
- Idle First
- Social First
- Long Term Progression

Se qualquer princípio for violado, a proposta deve ser rejeitada.

---

# Objetivo Final

Luvia deve parecer uma cidade viva.

O jogador não está tentando vencer.

Ele está tentando viver.
