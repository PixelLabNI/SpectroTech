// ===================================
// 1. CONFIGURAÇÃO DO FIREBASE (V9 MODULAR)
// ===================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// NOVO: Importação para Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyC3E77YNxUs2sm35xOXwz01EVB-g9CyQNM",
  authDomain: "portal-spectrotech.firebaseapp.com",
  projectId: "portal-spectrotech",
  storageBucket: "portal-spectrotech.firebasestorage.app",
  messagingSenderId: "1053602493345",
  appId: "1:1053602493345:web:4cc343601579f8a5f0d1e0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// NOVO: Inicializa o serviço de Auth
const auth = getAuth(app); 

console.log("Firebase App e Firestore (v9) inicializados.");


// ===================================
// 2. LÓGICA DO DARK MODE (UI/UX)
// ===================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme(prefersDark ? 'dark' : 'light');
}

if (themeToggle) { 
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ===================================
// 2.1 APRIMORAMENTO: LÓGICA DA UI GERAL (MENU, SCROLL, ETC.)
// ===================================

const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// --- Lógica do Menu Mobile ---
const menuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
    // Evento para abrir/fechar o menu
    menuToggle.addEventListener('click', () => {
        const isActive = mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isActive);
        body.classList.toggle('no-scroll', isActive); 
    });

    // --- APRIMORAMENTO: Fechar menu ao clicar no link ---
    const navLinks = mainNav.querySelectorAll('a');

    // Função para fechar o menu
    const closeMenu = () => {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('no-scroll');
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Só executa se o menu estiver ativo
            if (!mainNav.classList.contains('active')) {
                return;
            }

            const href = link.getAttribute('href');
            
            // Verifica se é um link de âncora NA MESMA PÁGINA
            // (começa com # OU é 'index.html#' e estamos em index.html)
            const isSamePageAnchor = (
                href.startsWith('#') || 
                (href.startsWith('index.html#') && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/'))
            ) && href.length > 1;


            if (isSamePageAnchor) {
                e.preventDefault(); // Previne o pulo imediato
                closeMenu();        // Fecha o menu

                // Espera a animação de 300ms do menu e depois rola suave
                setTimeout(() => {
                    const targetId = href.split('#')[1];
                    if (targetId) {
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }, 300); // Deve ser igual ao tempo de transição do CSS
            } else {
                // Para links externos (YouTube) ou outras páginas (post.html)
                // Apenas fecha o menu e deixa o navegador seguir o link
                closeMenu();
            }
        });
    });
}

// --- Botão "Voltar ao Topo" ---
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ===================================
// 3. VARIÁVEL GLOBAL E DETECÇÃO DE PÁGINA
// ===================================
let allPosts = []; 

document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    const postContent = document.getElementById('post-content');
    const searchInput = document.getElementById('search-input'); 

    if (postsContainer) {
        fetchBlogPosts();
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch); 
        }

    } else if (postContent) {
        fetchSinglePost();
    }
});


// ===================================
// 4. FUNÇÃO HELPER (AUXILIAR)
// ===================================
function formatDate(timestamp, style = 'long') {
    if (!timestamp || !timestamp.toDate) {
        return "Data indisponível";
    }
    const date = timestamp.toDate();
    
    let options = {};
    if (style === 'short') {
        options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
    } else { // 'long'
        options = {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
        };
    }

    return date.toLocaleDateString('pt-br', options);
}

// ===================================
// 4.1 LÓGICA DE BUSCA
// ===================================
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    const filteredPosts = allPosts.filter(post => {
        const title = post.data.title.toLowerCase();
        const snippet = post.data.snippet.toLowerCase();
        const tags = (post.data.tags || []).join(' ').toLowerCase();
        
        return title.includes(searchTerm) || snippet.includes(searchTerm) || tags.includes(searchTerm);
    });

    displayPosts(filteredPosts);
}


// ===================================
// 4.2 RENDERIZADOR DE POSTS (COM OTIMIZAÇÃO DE DOM)
// ===================================
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    const fragment = document.createDocumentFragment();
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Nenhum post encontrado para sua busca.</p>';
        return;
    }

    posts.forEach(postDoc => {
        const post = postDoc.data; 
        const postId = postDoc.id; 

        const thumbnailUrl = post.thumbnail || 'https://via.placeholder.com/400x200.png?text=spectrotech';
        const placeholderClass = post.thumbnail ? '' : 'placeholder';

        const tags = post.tags || [];
        let tagsHTML = '';
        if (tags.length > 0) {
            tagsHTML = `
                <div class="post-card-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
        }

        const postCard = document.createElement('article');
        postCard.classList.add('post-card');

        postCard.innerHTML = `
            <a href="post.html?id=${postId}" aria-label="Ler o post ${post.title}">
                <img src="${thumbnailUrl}" 
                    alt="Miniatura do post ${post.title}" 
                    class="post-card-image ${placeholderClass}" 
                    loading="lazy"
                    width="400" 
                    height="200">
            </a>
            <div class="post-card-content">
                <span class="post-card-date">${formatDate(post.timestamp, 'short')}</span> 
                ${tagsHTML}
                <a href="post.html?id=${postId}">
                    <h4>${post.title}</h4>
                </a>
                <p>${post.snippet}</p>
                <a href="post.html?id=${postId}" class="read-more">Ler Postagem</a>
            </div>
        `;
        fragment.appendChild(postCard); 
    });
    
    postsContainer.appendChild(fragment);
}


// ===================================
// 5. FUNÇÃO PARA A PÁGINA INICIAL (index.html)
// ===================================
async function fetchBlogPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Ainda não há tutoriais por aqui. Volte em breve!</p>';
            return;
        }

        allPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
        }));

        displayPosts(allPosts);

    } catch (error) {
        console.error("Erro ao buscar posts:", error);
        postsContainer.innerHTML = '<p style="text-align: center; padding: 40px 0;">Erro ao carregar as postagens. Tente novamente mais tarde.</p>';
    }
}


// ===================================
// 6. FUNÇÃO PARA A PÁGINA DE POST (post.html)
// ===================================
async function fetchSinglePost() {
    const postContent = document.getElementById('post-content');
    const postLoader = document.getElementById('post-loader'); 

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Post não encontrado</h2><p style="text-align: center;"><a href="index.html">Voltar ao início</a>.</p>';
        return;
    }
    
    postContent.setAttribute('aria-busy', 'true');

    try {
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef); 

        if (docSnap.exists()) {
            const post = docSnap.data(); 
            document.title = `${post.title} | SMarqueza Digital`;

            if (postLoader) postLoader.remove();
            
            const titlePlaceholder = document.getElementById('post-title-placeholder');
            const bodyPlaceholder = document.getElementById('post-body-placeholder');
            if (titlePlaceholder) titlePlaceholder.remove();
            if (bodyPlaceholder) bodyPlaceholder.remove();

            postContent.setAttribute('aria-busy', 'false');

            const tags = post.tags || [];
            let tagsHTML = '';
            if (tags.length > 0) {
                tagsHTML = `
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;
            }

            let postHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">
                    Publicado em ${formatDate(post.timestamp, 'long')} por Mateus Calixto
                </div>
                ${tagsHTML}
                <div class="post-body">
                    ${post.content} 
                </div>
            `;
            
            if (post.youtubeUrl && post.youtubeUrl.includes('embed')) {
                postHTML += `
                    <h3>Conteúdo em Vídeo</h3>
                    <div class="video-container">
                        <iframe src="${post.youtubeUrl}" 
                            title="${post.title} (Vídeo do YouTube)"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                `;
            }

            postHTML += `
                <div class="post-footer-cta">
                    <p>Gostou? <a href="index.html">Veja mais posts</a> ou</p>
                    <a href="https://github.com/PixelLabNI/SpectroTech" target="_blank" class="cta-button">Saiba Sobre a SpectroTech</a>
                </div>
            `;

            postContent.innerHTML = postHTML;
            
            if (typeof feather !== 'undefined' && feather.replace) {
                 feather.replace(); 
            }


        } else {
            postContent.setAttribute('aria-busy', 'false');
            console.error("Nenhum post encontrado com este ID:", postId);
            postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Post não encontrado</h2><p style="text-align: center;">Não foi possível encontrar este tutorial. <a href="index.html">Voltar ao início</a>.</p>';
        }
    } catch (error) {
        postContent.setAttribute('aria-busy', 'false');
        console.error("Erro ao buscar o post:", error);
        postContent.innerHTML = '<h2 style="text-align: center; padding: 40px 0;">Erro</h2><p style="text-align: center;">Ocorreu um erro ao carregar o post. Tente novamente.</p>';
    }
}

// NOVO: Exporta as variáveis para serem usadas pelo admin.js
export { db, auth, formatDate };