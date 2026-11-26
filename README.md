# 💍 Sistema de Casamento & Casa Nova (Nosso Sonho)

Sistema inteligente e completo desenvolvido para ajudar noivos a controlar o orçamento, prazos de fornecedores do casamento e tomar as melhores decisões de compra para a montagem da casa nova.

---

## ✨ Funcionalidades Principais

### 1. 📊 Visão Geral Consolidada (Dashboard)
- **Métricas unificadas**: Total já pago, saldo devedor restante e comparação com o orçamento estipulado para o casamento e para a casa.
- **Painel de Próximos Vencimentos**: Lista ordenada das parcelas a vencer nos próximos meses, com alerta para parcelas vencidas e botão de "Dar Baixa" com comemoração de confetes.
- **Gráficos de progresso**: Acompanhamento percentual de quitação de contratos e aquisição de mobília.

### 2. 💖 O Casamento (Contratos & Fornecedores)
- Cadastro de fornecedores por categoria (Local, Buffet, Foto/Vídeo, Decoração, DJ/Música, Assessoria, Trajes, etc.).
- **Geração automática de parcelas**: Defina o valor total, entrada e quantidade de parcelas para o sistema montar o cronograma com datas de vencimento mensais.
- Acompanhamento de status de cada parcela (Paga / Pendente / Vencida) e data de quitação.
- Contato do fornecedor, telefone/WhatsApp e anotações do contrato.

### 3. 🏡 Montagem da Casa (Cômodos & Compras)
- Organização por cômodos: *Sala de Estar, Cozinha, Quarto do Casal, Banheiro, Área de Serviço, Escritório/Varanda*.
- Níveis de prioridade: *Essencial (não dá pra mudar sem), Alta, Média e Baixa*.
- Status de compra: *Lista de Desejos, Em Pesquisa/Cotação, Já Comprado, Entregue*.
- Links diretos para as lojas, especificações e medidas importantes.
- Botão instantâneo **"Disputar (IA)"** para enviar qualquer produto diretamente para análise comparativa.

### 4. ⚖️ Disputa de Itens (IA 'O Que Compensa')
- Compare dois produtos lado a lado (Opção A vs Opção B).
- **Inteligência Artificial (Google Gemini)**: Analisa prós e contras, notas de custo-benefício (0 a 10), diferença de preço e se realmente compensa gastar a mais pela versão mais cara ou se a economia deve ser usada no casamento/reforma.
- **Dica de Ouro para o Casal**: Recomendações práticas sobre como comprar à vista com desconto, prazos de entrega e compatibilidade.
- **Bater o Martelo**: Escolha a opção vencedora com um clique, e ela será automaticamente adicionada/atualizada na lista da Casa Nova.

### 5. ⚙️ Backup & Compartilhamento Fácil
- Exportação e importação completa em formato JSON com 1 clique (para compartilhar entre os noivos e salvar cópias de segurança).
- Suporte a chave da API do Google Gemini (opcional) ou uso do avaliador heurístico inteligente integrado.

---

## 🚀 Como Executar

### Opção 1: Pelo arquivo executável (Windows)
Basta dar dois cliques no arquivo:
```
iniciar.bat
```

### Opção 2: Pelo Terminal / Prompt de Comando
```bash
npm run dev
```
O sistema abrirá automaticamente no navegador em:
`http://localhost:3000`

Para acessar pelo celular na mesma rede Wi-Fi, basta abrir o endereço de rede exibido no terminal (ex: `http://192.168.x.x:3000`).

---

## 🛠️ Tecnologias Utilizadas
- **React 18** + **TypeScript**
- **Vite** (inicialização instantânea e alta performance)
- **Tailwind CSS** (design elegante, mobile-first e responsivo)
- **Lucide Icons** (ícones modernos)
- **Canvas Confetti** (celebração interativa)
- **Google Gemini API** (análise e veredito inteligente de custo-benefício)
