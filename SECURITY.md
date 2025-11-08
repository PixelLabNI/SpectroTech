# 🛡️ Política de Segurança do SpectroTech Portal

A segurança é uma prioridade no desenvolvimento e operação do SpectroTech Portal. Agradecemos o esforço de pesquisadores e usuários que nos ajudam a manter a integridade e a privacidade de nossa plataforma.

Esta política descreve as medidas de segurança implementadas e como relatar vulnerabilidades.

---

## 🚨 Relatando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança neste projeto, pedimos que a comunique de forma responsável e privada.

### Como Relatar

1.  **Não abra um Issue público** no GitHub.
2.  Envie um e-mail para o mantenedor principal: `pixellabni@outlook.com` (baseado no footer do projeto).
3.  Inclua os seguintes detalhes:
    * **Descrição da Vulnerabilidade:** O que é e o que ela permite.
    * **Passos para Reproduzir:** Instruções claras e detalhadas para que possamos validar o problema.
    * **Escopo Afetado:** Onde o problema ocorre (Ex: `admin.html`, login do Firebase, etc.).
    * **Gravidade (Opcional):** Sua avaliação sobre o impacto (Baixa, Média, Alta, Crítica).
    * **Sua Chave Pública (Opcional):** Se desejar, inclua sua chave PGP para comunicação criptografada.

### Nosso Compromisso

Nós nos comprometemos a:

* Reconhecer o recebimento do seu relatório em até **48 horas úteis**.
* Investigar a vulnerabilidade prontamente.
* Manter você informado sobre o progresso da correção.
* Resolver e implantar uma correção o mais rápido possível.
* Reconhecer publicamente sua descoberta (se você concordar) após a correção ser implementada.

---

## ✅ Medidas de Segurança Implementadas

Este projeto front-end utiliza o Firebase para segurança no lado do servidor, o que mitiga muitos riscos comuns.

### 1. Autenticação e Autorização (Firebase Auth)

* **Acesso Restrito:** O painel de administração (`admin.html`) é estritamente protegido pela função `onAuthStateChanged` (implementada em `admin.js` e `app.js`), garantindo que apenas usuários autenticados possam ver o conteúdo.
* **Sign-Out Explícito:** O botão de `logout` em `admin.html` e o uso da função `signOut` em `admin.js` garantem que as sessões sejam encerradas corretamente.
* **Credenciais Privadas:** As credenciais do Firebase (`app.js`) são apenas chaves públicas de acesso à API, e não as chaves de serviço, minimizando o risco de acesso não autorizado à infraestrutura de backend.

### 2. Segurança do Banco de Dados (Cloud Firestore)

* **Regras de Segurança:** A segurança essencial reside nas **Regras de Segurança do Firestore**. É **CRUCIAL** que as seguintes regras estejam configuradas no Firebase Console:
    * **Leitura de Posts:** Deve ser pública (`allow read`).
    * **Criação, Atualização e Exclusão de Posts (CRUD):** Deve ser restrita apenas a usuários autenticados e/ou administradores específicos (`allow write: if request.auth != null;`).

    > **Recomendação:** Implementar regras que permitam `create`, `update` e `delete` apenas para usuários com IDs de administrador específicos ou roles definidas.

### 3. Proteção no Frontend

* **Sanitização de Conteúdo:** O código em `app.js` renderiza posts diretamente do Firestore. Embora os dados venham de uma fonte "confiável" (o Admin), é importante garantir que o conteúdo do campo `body` seja armazenado no Firestore com **sanitização de HTML** para prevenir ataques de **Cross-Site Scripting (XSS)**.
* **Dependências Atualizadas:** O projeto utiliza SDKs do Firebase (`9.6.1`) e Feather Icons, que devem ser mantidos atualizados para garantir que quaisquer vulnerabilidades de dependências sejam corrigidas.

---

## 🚫 Escopo da Política

Esta política abrange o código-fonte presente neste repositório:

* `index.html`, `post.html`, `admin.html`
* `style.css`, `admin-style.css`
* `app.js`, `admin.js`
* Qualquer arquivo estático de suporte (imagens, favicon).

**Obrigado por ajudar a manter o SpectroTech seguro!**
