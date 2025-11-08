# 💻 SpectroTech Portal

> **SpectroTech** é um portal de notícias e tutoriais focado em trazer profundidade e dicas essenciais do mundo digital. Este repositório contém o código-fonte da aplicação web front-end, que consome dados do **Google Firestore** e inclui um painel de administração para gerenciamento de conteúdo.

## ✨ Recursos Principais

* **Página Inicial (`index.html`):** Exibe uma lista de posts ordenados, com destaque para o conteúdo mais recente.
* **Página de Post Individual (`post.html`):** Exibição detalhada de cada artigo, incluindo título, metadados, corpo do texto e, opcionalmente, vídeos do YouTube incorporados.
* **Painel de Administração (`admin.html`):** Uma interface restrita para usuários autenticados (via Firebase Auth) gerenciarem os posts.
* **CRUD Completo (Admin):** Permite **Criar**, **Ler**, **Atualizar** e **Excluir** posts no Firestore.
* **Design Responsivo:** O layout se adapta perfeitamente a dispositivos móveis (vide `style.css` e `admin-style.css`).
* **Skeletor Loading:** Utiliza *placeholders* de carregamento para melhorar a experiência do usuário durante a busca de dados.

## 🛠️ Tecnologias Utilizadas

O projeto é construído como uma Single Page Application (SPA) estática (o servidor de dados é puramente Firebase/Firestore) utilizando:

* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Estilização:** CSS nativo (`style.css`, `admin-style.css`) com design responsivo.
* **Ícones:** [Feather Icons](https://feathericons.com/).
* **Backend:** **Firebase SDK (v9 Modular)** para:
    * **Firebase Authentication:** Login e proteção do Painel Admin.
    * **Cloud Firestore:** Banco de dados NoSQL para armazenar posts.

## 🚀 Como Configurar e Rodar

Siga estas etapas para configurar e executar o projeto localmente:

### 1. Configuração do Firebase

1.  Crie um novo projeto no [Firebase Console](https://console.firebase.google.com/).
2.  Configure o **Cloud Firestore** e o **Firebase Authentication** (habilitando o método "Email/Senha").
3.  Obtenha suas credenciais de configuração do app web (no Console, clique no ícone `</>`).

### 2. Atualizar Credenciais

Abra o arquivo `app.js` e substitua as configurações de `firebaseConfig` pelas suas credenciais:

```javascript
// app.js
const firebaseConfig = {
  apiKey: "SUA_API_KEY", // <--- Atualize aqui
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  // ... outras chaves
};
